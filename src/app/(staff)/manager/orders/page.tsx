'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Loader2 } from 'lucide-react'
import { formatETB, formatDate } from '@/lib/utils'
import { ORDER_STATUS_LABELS } from '@/lib/constants'

export default function ManagerOrdersPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('orders')
        .select(`*, order_items (*, menu_items (name)), tables (table_number)`)
        .order('created_at', { ascending: false })
        .limit(100)
      setOrders(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingBag className="w-8 h-8 text-orange-600" />
          ሁሉም ትዕዛዞች
        </h1>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <Card key={order.id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg">ጠረጴዛ {order.tables?.table_number}</h3>
                <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
              </div>
              <Badge>{ORDER_STATUS_LABELS[order.status] || order.status}</Badge>
            </div>
            <div className="space-y-1 text-sm mb-3">
              {order.order_items?.map((i: any) => (
                <div key={i.id} className="flex justify-between">
                  <span>{i.menu_items?.name} × {i.quantity}</span>
                  <span>{formatETB(i.price * i.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>ጠቅላላ</span>
              <span className="text-orange-600">{formatETB(order.total_price)}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
