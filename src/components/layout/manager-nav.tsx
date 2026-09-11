'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, ShoppingBag, Users, QrCode,
  Wallet, Activity, BarChart3,
} from 'lucide-react'

const items = [
  { href: '/manager', label: 'ዳሽቦርድ', icon: LayoutDashboard },
  { href: '/manager/orders', label: 'ትዕዛዞች', icon: ShoppingBag },
  { href: '/manager/tables', label: 'ጠረጴዛ + QR', icon: QrCode },
  { href: '/manager/staff', label: 'ሰራተኞች', icon: Users },
  { href: '/manager/expenses', label: 'ወጪዎች', icon: Wallet },
  { href: '/manager/activity', label: 'እንቅስቃሴ', icon: Activity },
  { href: '/owner/reports', label: 'ሪፖርቶች', icon: BarChart3 },
]

export default function ManagerNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b overflow-x-auto md:sticky md:top-[57px] md:z-30 fixed md:static bottom-0 left-0 right-0 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:shadow-none pb-[env(safe-area-inset-bottom)]">
      <div className="container mx-auto px-4 flex gap-1">
        {items.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-w-max flex-1 md:flex-none items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-3 md:py-3 text-xs md:text-sm font-medium whitespace-nowrap border-b-2 transition',
                active
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-orange-600'
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
