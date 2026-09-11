import { NextResponse } from 'next/server'

// Webhook ማዋቀሪያ (አንድ ጊዜ ብቻ ይጠራ)
export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!token || !appUrl) {
    return NextResponse.json(
      { error: 'TELEGRAM_BOT_TOKEN or APP_URL missing' },
      { status: 500 }
    )
  }

  const webhookUrl = `${appUrl}/api/telegram/webhook`

  const res = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`
  )
  const data = await res.json()

  return NextResponse.json({
    webhook: webhookUrl,
    telegramResponse: data,
  })
}
