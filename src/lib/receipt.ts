import { formatETB, formatDate } from './utils'

interface ReceiptData {
  order: any
  restaurant: { name: string; address?: string; phone?: string }
  waiter?: { name: string }
  payment: { amount: number; method: string }
}

export function printReceipt({ order, restaurant, waiter, payment }: ReceiptData) {
  const win = window.open('', '_blank', 'width=400,height=600')
  if (!win) return

  const itemsHtml = order.order_items
    ?.map((i: any) => `
      <tr>
        <td>${i.menu_items?.name || ''}</td>
        <td style="text-align:center">${i.quantity}</td>
        <td style="text-align:right">${formatETB(i.price * i.quantity)}</td>
      </tr>
    `)
    .join('') || ''

  win.document.write(`
    <html>
      <head>
        <title>ደረሰኝ</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            padding: 20px;
            max-width: 320px;
            font-size: 12px;
          }
          .center { text-align: center; }
          h1 { font-size: 18px; margin-bottom: 4px; }
          .muted { color: #666; font-size: 11px; }
          hr { border: none; border-top: 1px dashed #999; margin: 12px 0; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 3px 0; font-size: 12px; }
          .total { font-size: 16px; font-weight: bold; }
          .footer { margin-top: 20px; text-align: center; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="center">
          <h1>🍽️ ${restaurant.name}</h1>
          ${restaurant.address ? `<p class="muted">${restaurant.address}</p>` : ''}
          ${restaurant.phone ? `<p class="muted">${restaurant.phone}</p>` : ''}
        </div>

        <hr/>

        <div>
          <p>ቀን: ${formatDate(new Date())}</p>
          <p>ደረሰኝ #: ${order.id.slice(0, 8)}</p>
          ${waiter ? `<p>አስተናጋጅ: ${waiter.name}</p>` : ''}
        </div>

        <hr/>

        <table>
          <thead>
            <tr style="border-bottom: 1px dashed #999">
              <th style="text-align:left; padding-bottom:4px">ምግብ</th>
              <th style="text-align:center; padding-bottom:4px">ብዛት</th>
              <th style="text-align:right; padding-bottom:4px">ዋጋ</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <hr/>

        <table>
          <tr>
            <td class="total">ጠቅላላ</td>
            <td class="total" style="text-align:right">${formatETB(order.total_price)}</td>
          </tr>
          <tr>
            <td>የተከፈለ</td>
            <td style="text-align:right">${formatETB(payment.amount)}</td>
          </tr>
          <tr>
            <td>የክፍያ አይነት</td>
            <td style="text-align:right">${payment.method}</td>
          </tr>
        </table>

        <hr/>

        <div class="footer">
          <p>አመሰግናለሁ! 🙏</p>
          <p class="muted">እንደገና ይምጡ</p>
        </div>

        <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }</script>
      </body>
    </html>
  `)
  win.document.close()
}
