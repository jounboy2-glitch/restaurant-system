import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// ሽፍት ክፈት
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ክፍት ሽፍት አለ?
  const { data: existing } = await supabase
    .from('shifts')
    .select('*')
    .eq('waiter_id', user.id)
    .eq('status', 'open')
    .single()

  if (existing) {
    return NextResponse.json({ shift: existing, message: 'ሽፍት አስቀድሞ ክፍት ነው' })
  }

  const { data: branch } = await supabase.from('branches').select('id').limit(1).single()

  const { data, error } = await supabase
    .from('shifts')
    .insert({
      waiter_id: user.id,
      branch_id: branch?.id,
      status: 'open',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ shift: data })
}

// ሽፍት ዘጋ
export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { shift_id, actual_total } = await request.json()

  const { data: shift } = await supabase
    .from('shifts')
    .select('*')
    .eq('id', shift_id)
    .single()

  if (!shift) return NextResponse.json({ error: 'Shift not found' }, { status: 404 })

  const difference = Number(actual_total) - Number(shift.expected_total)

  const { data, error } = await supabase
    .from('shifts')
    .update({
      status: 'closed',
      end_time: new Date().toISOString(),
      actual_total,
      difference,
    })
    .eq('id', shift_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // ልዩነት ካለ → ለባለቤት ማሳወቂያ
  if (Math.abs(difference) > 0.01) {
    await supabase.from('notifications').insert({
      target_role: 'owner',
      message: `⚠️ ከስተመር — ${Math.abs(difference).toFixed(2)} ብር ${difference > 0 ? 'ትርፍ' : 'ጉድለት'} ተገኝቷል`,
    })

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      role: 'waiter',
      action_type: 'shift_close',
      entity: 'shift',
      entity_id: shift_id,
      amount: difference,
      description: `ሽፍት ተዘግቷል — ልዩነት: ${difference.toFixed(2)} ብር`,
    })
  }

  return NextResponse.json({ shift: data })
}

// የአሁን ሽፍት
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('shifts')
    .select('*')
    .eq('waiter_id', user.id)
    .eq('status', 'open')
    .single()

  return NextResponse.json({ shift: data })
}
