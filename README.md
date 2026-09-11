# 🍽️ Restaurant System

ዘመናዊ የሪስቶራንት ሲስተም — QR ሜኑ፣ ትዕዛዝ፣ ፋይናንስ፣ ሪፖርት እና Telegram ማሳወቂያ።

## ✨ ባህሪያት

### ለደንበኛ
- 📱 QR Code ስካን → ሜኑ ማየት → ትዕዛዝ ማስገባት
- 🍽️ የትዕዛዝ ሁኔታ በ real-time መከታተል
- 🌐 አማርኛ ድጋፍ

### ለከስተመር
- 🔔 Real-time ማሳወቂያ
- 💵 የክፍያ ማስገቢያ (Cash/Telebirr/Chapa/Card)
- 🕐 የሽፍት መክፈቻ/መዝጊያ + ማጠቃለያ
- 🖨️ ደረሰኝ ማተሚያ

### ለማናጀር
- 💰 ወጪዎች መመዝገብ
- 📝 የእንቅስቃሴ ሎግ (ሁሉም ተመዝግቧል)
- 🪑 ጠረጴዛ + QR Code ማስተዳደር
- 👥 ሰራተኞች ማስተዳደር

### ለባለቤት
- 📊 ሙሉ ሪፖርት (Daily/Weekly/Monthly)
- 📈 ትርፍ/ኪሳራ በግራፍ
- 📤 CSV + Excel export
- 🤖 Telegram ማሳወቂያ
- 🔍 የማናጀር እንቅስቃሴ ሙሉ ሎግ

## 🛠️ ቴክኖሎጂ

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime
- **Charts**: Recharts
- **PWA**: Service Worker + Manifest
- **Notifications**: Telegram Bot
- **Cron**: Supabase pg_cron
- **Hosting**: Vercel

## 🚀 እንዴት እንደሚጀመር

### 1. ጫን
\`\`\`bash
git clone <repo-url>
cd restaurant-system
npm install
\`\`\`

### 2. Environment
\`\`\`bash
cp .env.example .env.local
\`\`\`
ከዚያ `.env.local` ክፈትና ሁሉንም ሙላ።

### 3. Database
Supabase → SQL Editor → `supabase/schema.sql` → Run
ከዚያ `supabase/functions.sql` → Run
ከዚያ `supabase/rls-policies.sql` → Run
ከዚያ `supabase/cron.sql` → Run

### 4. Run
\`\`\`bash
npm run dev
\`\`\`
ክፈት → http://localhost:3000

### 5. Telegram Bot
1. `@BotFather` → `/newbot` → Token ቅዳ
2. Bot ክፈት → `/start`
3. Browser: `https://api.telegram.org/bot<TOKEN>/getUpdates` → `chat.id` ቅዳ
4. `.env.local` ሙላ
5. `/api/telegram/setup` ጎብኝ

## 📁 አደረጃጀት

\`\`\`
src/
├── app/
│   ├── (auth)/              # Login, Signup, Reset
│   ├── (customer)/          # ሜኑ + ትዕዛዝ
│   ├── (staff)/
│   │   ├── waiter/          # ትዕዛዝ + ክፍያ + ሽፍት
│   │   ├── kitchen/         # የምግብ ማዘጋጃ
│   │   ├── manager/         # ወጪ + ሰራተኛ + QR
│   │   └── owner/           # ሪፖርት + እንቅስቃሴ
│   └── api/
│       ├── orders/
│       ├── payments/
│       ├── shifts/
│       ├── reports/
│       ├── cron/            # ራስ-ሰር ሪፖርቶች
│       └── telegram/
├── components/
├── lib/
│   ├── supabase/
│   ├── telegram.ts
│   ├── excel.ts
│   ├── receipt.ts
│   └── utils.ts
└── types/
\`\`\`  

## 🔐 ደህንነት

- ✅ Row Level Security (RLS) ሙሉ
- ✅ Role-based access control
- ✅ JWT sessions
- ✅ Rate limiting
- ✅ Activity logging
- ✅ HTTPS only
- ✅ SQL injection መከላከያ

## 📈 የሲስተሙ ደረጃ

- ⚡ Page load < 2s
- ⚡ Notification < 1s
- 🛡️ 99.9% uptime target
- 📱 Mobile-first
- ♿ WCAG AA accessible
- 🌐 Multi-language (አማርኛ + English)

## 📝 ፈቃድ

MIT © 2025
