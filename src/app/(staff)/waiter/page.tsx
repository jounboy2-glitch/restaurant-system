'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Loader2, CheckCircle2, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { formatETB, formatDate } from '@/lib/utils'

export default function WaiterPage() {
  const supabase = createClient()
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function loadOrders() {
    const { data } = await supabase
      .from('orders')
      .select(`*, order_items (*, menu_items (name)), tables (table_number)`)
      .in('status', ['ready', 'delivered'])
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadOrders()
    const channel = supabase
      .channel('waiter-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadOrders())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  async function markDelivered(id: string) {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'delivered' }),
    })
    if (res.ok) {
      toast.success('ተላልፏል ✅')
      loadOrders()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    )
  }

  const readyOrders = orders.filter((o) => o.status === 'ready')
  const deliveredOrders = orders.filter((o) => o.status === 'delivered')

  return (
    <div className="container mx-auto p-4 py-8">
      <header className="mb-6 flex items-center gap-3">
        <Bell className="w-8 h-8 text-orange-600" />
        <h1 className="text-3xl font-bold">የከስተመር ዳሽቦርድ</h1>
        {readyOrders.length > 0 && (
          <Badge className="ml-auto bg-red-600 animate-pulse">{readyOrders.length} አስቸኳይ</Badge>
        )}
      </header>

      {readyOrders.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-red-600">🔔 ማድረስ ያለብህ</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {readyOrders.map((order) => (
              <Card key={order.id} className="p-4 border-2 border-red-300 bg-red-50">
                <div className="flex justify-between mb-2">
                  <h3 className="text-xl font-bold">ጠረጴዛ {order.tables?.table_number}</h3>
                  <Badge className="bg-red-600">ተዘጋጅቷል</Badge>
                </div>
                <p className="text-xs text-gray-500 mb-3">{formatDate(order.created_at)}</p>
                <div className="space-y-1 mb-4 text-sm">
                  {order.order_items?.map((i: any) => (
                    <div key={i.id} className="flex justify-between">
                      <span>{i.menu_items?.name}</span>
                      <span className="font-bold">× {i.quantity}</span>
                    </div>
                  ))}
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => markDelivered(order.id)}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  አድርሻለሁ
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold mb-4">💵 ክፍያ የሚጠበቁ</h2>
        {deliveredOrders.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">ምንም የለም</Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deliveredOrders.map((order) => (
              <Card key={order.id} className="p-4 border-2 border-orange-200">
                <div className="flex justify-between mb-2">
                  <h3 className="font-bold">ጠረጴዛ {order.tables?.table_number}</h3>
                  <Badge className="bg-orange-600">ያልተከፈለ</Badge>
                </div>
                <p className="text-sm text-gray-500 mb-2">{formatDate(order.created_at)}</p>
                <p className="font-bold text-orange-600 mb-3">{formatETB(order.total_price)}</p>
                <Button className="w-full" onClick={() => router.push('/waiter/payment')}>
                  <Wallet className="w-4 h-4 mr-2" />
                  ክፍያ ተቀበል
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
