import { requireAuth } from '@/lib/auth'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Mail, Phone, Shield } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  owner: 'ባለቤት', admin: 'አድሚን', manager: 'ማናጀር',
  waiter: 'ከስተመር', kitchen: 'ወጥ ቤት',
}

export default async function ProfilePage() {
  const user = await requireAuth()
  const initials = user.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="container mx-auto p-4 py-8 max-w-2xl">
      <Card className="p-8 text-center">
        <Avatar className="w-24 h-24 mx-auto mb-4">
          <AvatarFallback className="bg-orange-100 text-orange-700 text-2xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
        <Badge className="mb-6">{ROLE_LABELS[user.role] || user.role}</Badge>

        <div className="space-y-3 text-left">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-gray-500" />
            <span>{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-500" />
              <span>{user.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Shield className="w-5 h-5 text-gray-500" />
            <span>{ROLE_LABELS[user.role] || user.role}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
