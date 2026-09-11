import { requireRole } from '@/lib/auth'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const items = [
  { href: '/owner', label: 'ዳሽቦርድ' },
  { href: '/owner/reports', label: 'ሪፖርቶች' },
  { href: '/owner/activity', label: 'የማናጀር እንቅስቃሴ' },
]

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole(['owner', 'admin'])

  return (
    <div>
      <nav className="bg-gray-900 text-white border-b overflow-x-auto">
        <div className="container mx-auto px-4 flex gap-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 border-transparent hover:text-orange-400 transition"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      {children}
    </div>
  )
}
