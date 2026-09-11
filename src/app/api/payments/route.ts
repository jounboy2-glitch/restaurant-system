import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const paymentSchema = z.object({
  order_id: z.string().uuid(),
  shift_id: z.string().uuid().optional(),
  amount: z.number().positive(),
  method: z.enum(['cash', 'telebirr', 'chapa', 'card', 'bank', 'coupon']),
  note: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const data = paymentSchema.parse(body)

    // Payment አስገባ
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        order_id: data.order_id,
        waiter_id: user.id,
        shift_id: data.shift_id,
        amount: data.amount,
        method: data.method,
        note: data.note,
      })
      .select()
      .single()

    if (error) throw error

    // Order ወደ 'completed' ቀይር
    await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', data.order_id)

    // Activity log
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      role: 'waiter',
      action_type: 'payment_add',
      entity: 'payment',
      entity_id: payment.id,
      amount: data.amount,
      description: `ክፍያ ተቀብሏል: ${data.amount} ብር (${data.method})`,
    })

    return NextResponse.json({ payment }, { status: 201 })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const shiftId = searchParams.get('shift_id')
  const waiterId = searchParams.get('waiter_id')

  const supabase = await createClient()
  let query = supabase.from('payments').select('*').order('created_at', { ascending: false })

  if (shiftId) query = query.eq('shift_id', shiftId)
  if (waiterId) query = query.eq('waiter_id', waiterId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ payments: data })
}
