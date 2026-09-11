import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const orderSchema = z.object({
  table_id: z.string().uuid(),
  customer_name: z.string().optional(),
  items: z.array(z.object({
    menu_item_id: z.string().uuid(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
    notes: z.string().optional(),
  })).min(1),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const data = orderSchema.parse(body)

    const total = data.items.reduce((sum, i) => sum + i.price * i.quantity, 0)

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ table_id: data.table_id, customer_name: data.customer_name, total_price: total, status: 'pending' })
      .select()
      .single()

    if (orderError) throw orderError

    const orderItems = data.items.map((i) => ({
      order_id: order.id,
      menu_item_id: i.menu_item_id,
      quantity: i.quantity,
      price: i.price,
      notes: i.notes,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) throw itemsError

    await supabase.from('notifications').insert([
      { order_id: order.id, target_role: 'waiter', message: 'አዲስ ትዕዛዝ!' },
      { order_id: order.id, target_role: 'kitchen', message: 'አዲስ ትዕዛዝ ደርሷል!' },
    ])

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'ትዕዛዝ ማስገባት አልተቻለም' }, { status: 500 })
  }
}

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select(`*, order_items (*), tables (table_number)`)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ orders: data })
}
