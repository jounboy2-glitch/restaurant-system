import { requireRole } from '@/lib/auth'
import ManagerNav from '@/components/layout/manager-nav'

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole(['owner', 'admin', 'manager'])

  return (
    <div>
      <ManagerNav />
      {children}
    </div>
  )
}
