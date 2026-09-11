import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') || 'today' // today | week | month | year
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  const supabase = await createClient()

  let startDate: Date
  let endDate = new Date()

  if (from && to) {
    startDate = new Date(from)
    endDate = new Date(to)
  } else {
    startDate = new Date()
    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
    }
  }

  // ገቢ
  const { data: payments } = await supabase
    .from('payments')
    .select('amount, method, created_at')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // ወጪ
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount, category, created_at')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // ትዕዛዞች
  const { data: orders } = await supabase
    .from('orders')
    .select('total_price, status, created_at')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const totalRevenue = payments?.reduce((s, p) => s + Number(p.amount), 0) || 0
  const totalExpenses = expenses?.reduce((s, e) => s + Number(e.amount), 0) || 0
  const profit = totalRevenue - totalExpenses
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0

  // በክፍያ አይነት
  const byMethod = payments?.reduce((acc: any, p) => {
    acc[p.method] = (acc[p.method] || 0) + Number(p.amount)
    return acc
  }, {}) || {}

  // በወጪ ምድብ
  const byCategory = expenses?.reduce((acc: any, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
    return acc
  }, {}) || {}

  return NextResponse.json({
    period,
    from: startDate.toISOString(),
    to: endDate.toISOString(),
    summary: {
      totalRevenue,
      totalExpenses,
      profit,
      margin,
      orderCount: orders?.length || 0,
      paymentCount: payments?.length || 0,
    },
    byMethod,
    byCategory,
  })
}
