import { requireRole } from '@/lib/auth'
import WaiterNav from '@/components/layout/waiter-nav'

export default async function WaiterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole(['owner', 'admin', 'manager', 'waiter'])
  return (
    <div>
      <WaiterNav />
      {children}
    </div>
  )
}
