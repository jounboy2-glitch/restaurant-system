import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { sendTelegramMessage, formatReportMessage } from '@/lib/telegram'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function GET(request: Request) {
  // ደህንነት — Cron secret አረጋግጥ
  const authHeader = request.headers.get('authorization')
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = getSupabaseAdmin()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [payments, expenses, orders] = await Promise.all([
      supabase
        .from('payments')
        .select('amount')
        .gte('created_at', today.toISOString()),
      supabase
        .from('expenses')
        .select('amount')
        .gte('created_at', today.toISOString()),
      supabase
        .from('orders')
        .select('id')
        .gte('created_at', today.toISOString()),
    ])

    const totalRevenue =
      payments.data?.reduce((s, p) => s + Number(p.amount), 0) || 0
    const totalExpenses =
      expenses.data?.reduce((s, e) => s + Number(e.amount), 0) || 0
    const profit = totalRevenue - totalExpenses
    const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0

    const reportData = {
      totalRevenue,
      totalExpenses,
      profit,
      margin,
      orderCount: orders.data?.length || 0,
      paymentCount: payments.data?.length || 0,
    }

    // Telegram ላክ
    const message = formatReportMessage('📊 የዛሬ ሪፖርት', reportData)
    await sendTelegramMessage(message)

    // Notification አስገባ
    await supabase.from('notifications').insert({
      target_role: 'owner',
      message: `📊 የዛሬ ሪፖርት: ገቢ ${totalRevenue.toFixed(2)} ብር | ትርፍ ${profit.toFixed(2)} ብር`,
    })

    return NextResponse.json({
      success: true,
      report: reportData,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Daily report error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
