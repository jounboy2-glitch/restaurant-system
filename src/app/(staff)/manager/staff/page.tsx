'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Users, Mail, Phone, Loader2 } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  owner: 'ባለቤት',
  admin: 'አድሚን',
  manager: 'ማናጀር',
  waiter: 'ከስተመር',
  kitchen: 'ወጥ ቤት',
}

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-700',
  admin: 'bg-blue-100 text-blue-700',
  manager: 'bg-green-100 text-green-700',
  waiter: 'bg-orange-100 text-orange-700',
  kitchen: 'bg-red-100 text-red-700',
}

export default function StaffPage() {
  const supabase = createClient()
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      setStaff(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="w-8 h-8 text-orange-600" />
          ሰራተኞች
        </h1>
        <p className="text-gray-500 mt-1">የሁሉም ሰራተኞች ዝርዝር</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((s) => {
          const initials = s.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
          return (
            <Card key={s.id} className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarFallback className="bg-orange-100 text-orange-700 font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{s.name}</h3>
                  <Badge className={`mt-1 ${ROLE_COLORS[s.role] || ''}`} variant="secondary">
                    {ROLE_LABELS[s.role] || s.role}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-gray-600">
                {s.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{s.email}</span>
                  </div>
                )}
                {s.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{s.phone}</span>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {staff.length === 0 && (
        <div className="text-center py-20">
          <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">ሰራተኛ የለም</p>
        </div>
      )}
    </div>
  )
}
