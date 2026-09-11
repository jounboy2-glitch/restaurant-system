'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, ChefHat, Bell, Loader2 } from 'lucide-react'
import { formatETB } from '@/lib/utils'
import { ORDER_STATUS_LABELS } from '@/lib/constants'

const STATUS_STEPS = [
  { key: 'pending', label: 'ተቀብሏል', icon: Clock },
  { key: 'accepted', label: 'በመዘጋጀት ላይ', icon: ChefHat },
  { key: 'ready', label: 'ተዘጋጅቷል', icon: Bell },
  { key: 'delivered', label: 'ደርሷል', icon: CheckCircle2 },
]

export default function OrderStatusPage() {
  const { id } = useParams() as { id: string }
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadOrder() {
      const { data } = await supabase
        .from('orders')
        .select(`*, order_items (*, menu_items (name)), tables (table_number)`)
        .eq('id', id)
        .single()
      setOrder(data)
      setLoading(false)
    }
    loadOrder()

    const channel = supabase
      .channel(`order-${id}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` },
        (payload) => setOrder((prev: any) => ({ ...prev, ...payload.new }))
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (!order) return <div className="p-8 text-center">ትዕዛዝ አልተገኘም</div>

  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === order.status)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-lg mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">ትዕዛዝዎ ተቀብሏል! 🍽️</h1>
          <p className="text-gray-600">ጠረጴዛ {order.tables?.table_number}</p>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="font-bold mb-4">የትዕዛዝ ሁኔታ</h2>
          <div className="space-y-4">
            {STATUS_STEPS.map((step, idx) => {
              const Icon = step.icon
              const isDone = idx <= currentIdx
              const isCurrent = idx === currentIdx
              return (
                <div key={step.key} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isDone ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-orange-200 animate-pulse' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`font-medium ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-bold mb-4">ዝርዝር</h2>
          <div className="space-y-2">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.menu_items?.name} × {item.quantity}</span>
                <span>{formatETB(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg">
              <span>ጠቅላላ</span>
              <span className="text-orange-600">{formatETB(order.total_price)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
