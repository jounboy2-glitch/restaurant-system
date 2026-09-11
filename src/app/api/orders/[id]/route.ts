import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { status } = await request.json()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const messages: Record<string, { role: string; text: string }> = {
    accepted: { role: 'customer', text: 'ትዕዛዝዎ ተቀብሏል! 🍽️' },
    ready: { role: 'waiter', text: 'ምግብ ደርሷል! አድርሺው' },
    delivered: { role: 'customer', text: 'ምግብህ ደርሷል! 🎉' },
  }

  if (messages[status]) {
    await supabase.from('notifications').insert({
      order_id: id,
      target_role: messages[status].role,
      message: messages[status].text,
    })
  }

  return NextResponse.json({ order: data })
}
