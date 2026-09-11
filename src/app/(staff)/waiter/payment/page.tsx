'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Wallet, Loader2, CheckCircle2, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { formatETB } from '@/lib/utils'
import { printReceipt } from '@/lib/receipt'

const PAYMENT_METHODS = [
  { value: 'cash', label: '💵 ጥሬ ገንዘብ' },
  { value: 'telebirr', label: '📱 ቴሌብር' },
  { value: 'chapa', label: '💳 ቻፓ' },
  { value: 'card', label: '💳 ካርድ' },
  { value: 'bank', label: '🏦 ባንክ' },
  { value: 'coupon', label: '🎫 ኩፖን' },
]

export default function PaymentEntryPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<any[]>([])
  const [shift, setShift] = useState<any>(null)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [payment, setPayment] = useState({ amount: '', method: 'cash', note: '' })
  const [lastPaid, setLastPaid] = useState<any>(null)

  async function load() {
    const { data: ordersData } = await supabase
      .from('orders')
      .select(`*, order_items (*, menu_items (name)), tables (table_number)`)
      .in('status', ['delivered'])
      .order('created_at', { ascending: true })

    const shiftRes = await fetch('/api/shifts')
    const { shift: shiftData } = await shiftRes.json()

    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      const { data: profile } = await supabase
        .from('users').select('*').eq('id', authUser.id).single()
      setUser(profile)
    }

    const { data: rest } = await supabase.from('restaurants').select('*').limit(1).single()

    setOrders(ordersData || [])
    setShift(shiftData)
    setRestaurant(rest)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function submitPayment() {
    if (!payment.amount || parseFloat(payment.amount) <= 0) {
      return toast.error('ትክክለኛ መጠን አስገባ')
    }

    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: selectedOrder.id,
        shift_id: shift?.id,
        amount: parseFloat(payment.amount),
        method: payment.method,
        note: payment.note,
      }),
    })

    if (!res.ok) {
      const error = await res.json()
      return toast.error(error.error || 'ክፍያ ማስገባት አልተቻለም')
    }

    const paidOrder = selectedOrder
    const paidAmount = parseFloat(payment.amount)
    const paidMethod = payment.method

    toast.success('ክፍያ ተቀብሏል ✅')

    setSelectedOrder(null)
    setPayment({ amount: '', method: 'cash', note: '' })

    // ደረሰኝ አሳይ
    setLastPaid({
      order: paidOrder,
      amount: paidAmount,
      method: paidMethod,
    })

    load()
  }

  function printCurrentReceipt() {
    if (!lastPaid) return
    printReceipt({
      order: lastPaid.order,
      restaurant: restaurant || { name: 'Restaurant' },
      waiter: user || undefined,
      payment: { amount: lastPaid.amount, method: lastPaid.method },
    })
  }

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
          <Wallet className="w-8 h-8 text-orange-600" />
          የክፍያ ማስገቢያ
        </h1>
        <p className="text-gray-500 mt-1">
          {shift ? `ሽፍት ክፍት — የተጠበቀ: ${formatETB(shift.expected_total)}` : 'ሽፍት ይክፈቱ'}
        </p>
      </div>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <p className="text-gray-500 text-lg">ሁሉም ትዕዛዞች ተከፍለዋል ✅</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => {
                setSelectedOrder(order)
                setPayment({ ...payment, amount: String(order.total_price) })
              }}
            >
              <div className="flex justify-between mb-3">
                <h3 className="text-xl font-bold">ጠረጴዛ {order.tables?.table_number}</h3>
                <Badge className="bg-blue-600">ያልተከፈለ</Badge>
              </div>
              <div className="space-y-1 text-sm mb-3">
                {order.order_items?.map((i: any) => (
                  <div key={i.id} className="flex justify-between">
                    <span>{i.menu_items?.name} × {i.quantity}</span>
                    <span>{formatETB(i.price * i.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>ጠቅላላ</span>
                <span className="text-orange-600">{formatETB(order.total_price)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Payment Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ክፍያ ተቀበል</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">ጠረጴዛ {selectedOrder.tables?.table_number}</p>
                <p className="text-3xl font-bold text-orange-600">
                  {formatETB(selectedOrder.total_price)}
                </p>
              </div>

              <div>
                <Label>የክፍያ አይነት</Label>
                <Select value={payment.method} onValueChange={(v) => setPayment({ ...payment, method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>መጠን (ብር)</Label>
                <Input type="number" value={payment.amount}
                  onChange={(e) => setPayment({ ...payment, amount: e.target.value })} />
              </div>

              <div>
                <Label>ማስታወሻ (አማራጭ)</Label>
                <Input value={payment.note}
                  onChange={(e) => setPayment({ ...payment, note: e.target.value })}
                  placeholder="ለምሳሌ: ደረሰኝ ቁጥር..." />
              </div>

              <Button onClick={submitPayment} className="w-full" size="lg">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                ክፍያ ተቀብሏል
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={!!lastPaid} onOpenChange={() => setLastPaid(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ደረሰኝ ዝግጁ ነው ✅</DialogTitle>
          </DialogHeader>
          {lastPaid && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-2" />
                <p className="font-bold text-lg">ክፍያ ተቀብሏል</p>
                <p className="text-2xl font-bold text-green-700">{formatETB(lastPaid.amount)}</p>
              </div>

              <div className="flex gap-2">
                <Button onClick={printCurrentReceipt} variant="outline" className="flex-1">
                  <Printer className="w-4 h-4 mr-2" /> አትም
                </Button>
                <Button onClick={() => setLastPaid(null)} className="flex-1">
                  ዝጋ
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
