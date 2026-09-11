import { NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/lib/telegram'

// የቴሌግራም ትዕዛዞች
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const message = body.message

    if (!message || !message.text) {
      return NextResponse.json({ ok: true })
    }

    const text = message.text.trim()
    const chatId = String(message.chat.id)

    // /start
    if (text === '/start') {
      await sendTelegramMessage(
        `👋 <b>እንኳን ደህና መጡ!</b>\n\n` +
        `ይህ የሪስቶራንት ማስተዳደሪያ ቦት ነው።\n\n` +
        `<b>የሚገኙ ትዕዛዞች፦</b>\n` +
        `/today — የዛሬ ሪፖርት\n` +
        `/week — የሳምንቱ ሪፖርት\n` +
        `/month — የወሩ ሪፖርት\n` +
        `/status — የሲስተሙ ሁኔታ\n` +
        `/help — እገዛ`,
        chatId
      )
      return NextResponse.json({ ok: true })
    }

    // /help
    if (text === '/help') {
      await sendTelegramMessage(
        `<b>📚 እገዛ</b>\n\n` +
        `ይህ ቦት የሪስቶራንትዎን ሪፖርት በራስ-ሰር ይልካል።\n\n` +
        `ለተጨማሪ መረጃ ወይም ችግር፦\n` +
        `📧 support@restaurant.com`,
        chatId
      )
      return NextResponse.json({ ok: true })
    }

    // /today
    if (text === '/today') {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const res = await fetch(`${baseUrl}/api/reports?period=today`, {
        headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
      })
      const data = await res.json()
      const s = data.summary

      await sendTelegramMessage(
        `📊 <b>የዛሬ ሪፖርት</b>\n` +
        `━━━━━━━━━━━━━━━━━\n` +
        `💰 ገቢ: <b>${Number(s.totalRevenue).toFixed(2)} ብር</b>\n` +
        `💸 ወጪ: <b>${Number(s.totalExpenses).toFixed(2)} ብር</b>\n` +
        `${s.profit >= 0 ? '📈' : '📉'} ${s.profit >= 0 ? 'ትርፍ' : 'ኪሳራ'}: <b>${Math.abs(s.profit).toFixed(2)} ብር</b>\n` +
        `📦 ትዕዛዞች: ${s.orderCount}\n` +
        `💳 ክፍያዎች: ${s.paymentCount}`,
        chatId
      )
      return NextResponse.json({ ok: true })
    }

    // /status
    if (text === '/status') {
      await sendTelegramMessage(
        `✅ <b>ሲስተሙ በጥሩ ሁኔታ ላይ ነው</b>\n\n` +
        `🕐 ሰዓት: ${new Date().toLocaleString('am-ET')}\n` +
        `📡 ሁኔታ: <b>ንቁ</b>`,
        chatId
      )
      return NextResponse.json({ ok: true })
    }

    // ያልታወቀ ትዕዛዝ
    await sendTelegramMessage(
      `❓ ያልታወቀ ትዕዛዝ። /help ይጠቀሙ።`,
      chatId
    )
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json({ ok: true })
  }
}
