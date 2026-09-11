'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Check } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function NotificationBell({ role }: { role: string }) {
  const supabase = createClient()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unread, setUnread] = useState(0)

  async function load() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('target_role', role)
      .order('created_at', { ascending: false })
      .limit(20)

    setNotifications(data || [])
    setUnread((data || []).filter((n) => !n.is_read).length)
  }

  useEffect(() => {
    load()

    const channel = supabase
      .channel(`notif-${role}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `target_role=eq.${role}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev])
          setUnread((u) => u + 1)

          // ድምጽ + Vibration
          try {
            const audio = new Audio('/notification.mp3')
            audio.volume = 0.5
            audio.play().catch(() => {})
            if ('vibrate' in navigator) navigator.vibrate(200)
          } catch {}
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [role])

  async function markAllRead() {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('target_role', role)
      .eq('is_read', false)
    setUnread(0)
    load()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 p-0 flex items-center justify-center bg-red-600">
              {unread > 9 ? '9+' : unread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>ማሳወቂያዎች</span>
          {unread > 0 && (
            <Button size="sm" variant="ghost" onClick={markAllRead}>
              <Check className="w-3 h-3 mr-1" /> ሁሉንም አንብብ
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">ምንም ማሳወቂያ የለም</div>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem key={n.id} className="flex flex-col items-start p-3 cursor-default">
              <div className="flex items-start gap-2 w-full">
                {!n.is_read && (
                  <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`text-sm ${!n.is_read ? 'font-medium' : ''}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(n.created_at)}</p>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
