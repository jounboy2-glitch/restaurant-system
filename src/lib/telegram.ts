const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

export async function sendTelegramMessage(
  message: string,
  chatId?: string
): Promise<boolean> {
  const targetChat = chatId || process.env.TELEGRAM_OWNER_CHAT_ID

  if (!process.env.TELEGRAM_BOT_TOKEN || !targetChat) {
    console.warn('Telegram credentials missing')
    return false
  }

  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChat,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })

    return res.ok
  } catch (error) {
    console.error('Telegram error:', error)
    return false
  }
}

export function formatReportMessage(title: string, data: any): string {
  const profitEmoji = data.profit >= 0 ? '📈' : '📉'
  const profitLabel = data.profit >= 0 ? 'ትርፍ' : 'ኪሳራ'

  return `
<b>${title}</b>
━━━━━━━━━━━━━━━━━

💰 <b>ገቢ:</b> ${formatETB(data.totalRevenue)}
💸 <b>ወጪ:</b> ${formatETB(data.totalExpenses)}
${profitEmoji} <b>${profitLabel}:</b> ${formatETB(Math.abs(data.profit))}
📊 <b>ማርጅን:</b> ${data.margin.toFixed(1)}%

📦 <b>ትዕዛዞች:</b> ${data.orderCount}
💳 <b>ክፍያዎች:</b> ${data.paymentCount}

━━━━━━━━━━━━━━━━━
<i>${new Date().toLocaleString('am-ET')}</i>
  `.trim()
}

function formatETB(amount: number): string {
  return `${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ብር`
}
