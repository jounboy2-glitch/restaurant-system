'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChefHat, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

export default function KitchenPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  async function loadOrders() {
    const { data } = await supabase
      .from('orders')
      .select(`*, order_items (*, menu_items (name)), tables (table_number)`)
      .in('status', ['pending', 'accepted', 'preparing'])
      .order('created_at', { ascending: true })
    setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadOrders()

    const channel = supabase
      .channel('kitchen-orders')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => loadOrders()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      toast.success('ተዘምኗል')
      loadOrders()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <header className="mb-6 flex items-center gap-3">
        <ChefHat className="w-8 h-8 text-orange-400" />
        <h1 className="text-3xl font-bold">የወጥ ቤት ስክሪን</h1>
        <Badge className="ml-auto bg-orange-600">{orders.length} ትዕዛዞች</Badge>
      </header>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-xl">አዲስ ትዕዛዝ የለም</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="bg-gray-800 border-gray-700 text-white p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-2xl font-bold">ጠረጴዛ {order.tables?.table_number}</h3>
                  <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                </div>
                <Badge className={
                  order.status === 'pending' ? 'bg-yellow-600' :
                  order.status === 'accepted' ? 'bg-blue-600' : 'bg-purple-600'
                }>
                  {order.status === 'pending' ? 'አዲስ' :
                   order.status === 'accepted' ? 'ተቀብሏል' : 'በመዘጋጀት'}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between bg-gray-700 p-2 rounded">
                    <span className="font-medium">{item.menu_items?.name}</span>
                    <span className="font-bold text-orange-400">× {item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <Button className="w-full" size="sm" onClick={() => updateStatus(order.id, 'accepted')}>
                    ተቀበል
                  </Button>
                )}
                {order.status === 'accepted' && (
                  <Button className="w-full bg-purple-600 hover:bg-purple-700" size="sm"
                    onClick={() => updateStatus(order.id, 'preparing')}>
                    ጀምር
                  </Button>
                )}
                {order.status === 'preparing' && (
                  <Button className="w-full bg-green-600 hover:bg-green-700" size="sm"
                    onClick={() => updateStatus(order.id, 'ready')}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    ተዘጋጅቷል
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
