'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Plus, Minus, X, Loader2 } from 'lucide-react'
import { formatETB } from '@/lib/utils'
import { toast } from 'sonner'
import type { CartItem } from '@/types'

export default function MenuClient({ table, categories, restaurant }: any) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  function addToCart(item: any) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }]
    })
    toast.success(`${item.name} ተጨምሯል`)
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) =>
      prev.map((i) => i.id === id ? { ...i, quantity: i.quantity + delta } : i)
          .filter((i) => i.quantity > 0)
    )
  }

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0)

  async function submitOrder() {
    if (cart.length === 0) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_id: table.id,
          items: cart.map((i) => ({ menu_item_id: i.id, quantity: i.quantity, price: i.price })),
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const { order } = await res.json()
      toast.success('ትዕዛዝዎ ተቀብሏል! 🍽️')
      router.push(`/order/${order.id}/status`)
    } catch {
      toast.error('ትዕዛዝ ማስገባት አልተቻለም')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{restaurant?.name}</h1>
            <p className="text-sm text-gray-500">ጠረጴዛ {table.table_number}</p>
          </div>
          <Button variant="outline" size="icon" className="relative" onClick={() => setShowCart(true)}>
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-orange-600">{itemCount}</Badge>
            )}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-8">
        {categories.map((cat: any) => (
          <section key={cat.id}>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span>{cat.icon}</span> {cat.name}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {cat.menu_items?.filter((m: any) => m.is_available).map((item: any) => (
                <Card key={item.id} className="p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      )}
                      <p className="text-orange-600 font-bold mt-2">{formatETB(item.price)}</p>
                    </div>
                    <Button size="sm" onClick={() => addToCart(item)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </main>

      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
          <Button className="w-full" size="lg" onClick={() => setShowCart(true)}>
            <ShoppingCart className="w-5 h-5 mr-2" />
            ጋሪ ይመልከቱ — {itemCount} እቃ — {formatETB(total)}
          </Button>
        </div>
      )}

      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">ጋሪ</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowCart(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {cart.length === 0 ? (
              <p className="text-center text-gray-500 py-8">ጋሪ ባዶ ነው</p>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">{formatETB(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button size="icon" variant="outline" className="h-8 w-8"
                          onClick={() => updateQty(item.id, -1)}>
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                        <Button size="icon" variant="outline" className="h-8 w-8"
                          onClick={() => updateQty(item.id, 1)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>ጠቅላላ</span>
                    <span className="text-orange-600">{formatETB(total)}</span>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={submitOrder} disabled={submitting}>
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />በመላክ ላይ...</> : 'ትዕዛዝ አስገባ'}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
