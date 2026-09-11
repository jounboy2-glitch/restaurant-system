'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Loader2, TrendingUp, TrendingDown } from 'lucide-react'
import { formatETB, formatDate } from '@/lib/utils'

const ACTION_LABELS: Record<string, string> = {
  expense_add: '💰 ወጪ ተመዝግቧል',
  menu_add: '➕ ምግብ ተጨምሯል',
  menu_edit: '✏️ ምግብ ተቀይሯል',
  menu_delete: '🗑️ ምግብ ተሰርዟል',
  staff_hire: '👥 ሰራተኛ ተቀጥሯል',
  staff_fire: '❌ ሰራተኛ ተባርሯል',
  salary_pay: '💵 ደመወዝ ተከፍሏል',
}

export default function ActivityPage() {
  const supabase = createClient()
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
      setActivities(data || [])
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
          <Activity className="w-8 h-8 text-orange-600" />
          የእንቅስቃሴ ሎግ
        </h1>
        <p className="text-gray-500 mt-1">ሁሉም የማናጀር እንቅስቃሴዎች</p>
      </div>

      <Card className="p-6">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-8">ምንም እንቅስቃሴ የለም</p>
        ) : (
          <div className="space-y-3">
            {activities.map((a) => (
              <div key={a.id} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">
                      {ACTION_LABELS[a.action_type] || a.action_type}
                    </Badge>
                    {a.role && (
                      <Badge variant="outline" className="text-xs">{a.role}</Badge>
                    )}
                  </div>
                  <p className="font-medium">{a.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(a.created_at)}</p>
                </div>
                {a.amount && (
                  <p className={`font-bold ${Number(a.amount) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatETB(a.amount)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
