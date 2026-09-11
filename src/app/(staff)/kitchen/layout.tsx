import { requireRole } from '@/lib/auth'

export default async function KitchenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole(['owner', 'admin', 'manager', 'kitchen'])
  return <>{children}</>
}
