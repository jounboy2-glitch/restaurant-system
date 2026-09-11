import { requireAuth } from '@/lib/auth'
import Header from '@/components/layout/header'

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <main>{children}</main>
    </div>
  )
}
