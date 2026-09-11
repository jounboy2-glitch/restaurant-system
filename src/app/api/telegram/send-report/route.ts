import { NextResponse } from 'next/server'
import { sendTelegramMessage, formatReportMessage } from '@/lib/telegram'

export async function POST(request: Request) {
  try {
    const { period, report } = await request.json()
    const s = report.summary

    const periodLabel: Record<string, string> = {
      today: 'የዛሬ',
      week: 'የሳምንቱ',
      month: 'የወሩ',
      year: 'የዓመቱ',
    }

    const message = formatReportMessage(
      `📊 ${periodLabel[period] || period} ሪፖርት`,
      {
        totalRevenue: s.totalRevenue,
        totalExpenses: s.totalExpenses,
        profit: s.profit,
        margin: s.margin,
        orderCount: s.orderCount,
        paymentCount: s.paymentCount,
      }
    )

    const ok = await sendTelegramMessage(message)
    return NextResponse.json({ success: ok })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
