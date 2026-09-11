import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UtensilsCrossed, QrCode, ChefHat, BarChart3 } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <UtensilsCrossed className="w-4 h-4" />
            ዘመናዊ የሪስቶራንት ሲስተም
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            የሪስቶራንትዎን አገልግሎት
            <span className="block text-orange-600 mt-2">ወደ ዘመናዊ ደረጃ ያሳድጉ</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8">
            QR Code በመጠቀም ደንበኞች በስልካቸው ሜኑ ይመለከታሉ፣ ትዕዛዝ ያስገባሉ፣ ክፍያ ይከፍላሉ።
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">ለሰራተኞች →</Button>
            </Link>
            <Link href="/menu/33333333-3333-3333-3333-333333333331">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">የደንበኛ ሙከራ</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: QrCode, title: 'QR Code ሜኑ', desc: 'ደንበኞች ስካን አድርገው ሜኑ ያያሉ።' },
            { icon: ChefHat, title: 'ፈጣን ትዕዛዝ', desc: 'ትዕዛዝ ወዲያውኑ ወደ ወጥ ቤት ይደርሳል።' },
            { icon: BarChart3, title: 'ሙሉ ቁጥጥር', desc: 'ትርፍ/ኪሳራ እና ሪፖርት በአንድ ቦታ።' },
          ].map((f, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition">
              <f.icon className="w-10 h-10 text-orange-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
