'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Activity, Loader2, Search } from 'lucide-react'
import { formatETB, formatDate } from '@/lib/utils'

const ACTION_LABELS: Record<string, string> = {
  expense_add: '💰 ወጪ',
  payment_add: '💵 ክፍያ',
  shift_close: '🕐 ሽፍት ተዘግቷል',
  order_status: '📦 ትዕዛዝ',
  menu_add: '➕ ምግብ ተጨምሯል',
  menu_edit: '✏️ ምግብ ተቀይሯል',
  menu_delete: '🗑️ ምግብ ተሰርዟል',
}

export default function OwnerActivityPage() {
  const supabase = createClient()
  const [activities, setActivities] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)
      setActivities(data || [])
      setFiltered(data || [])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    let result = activities
    if (search) {
      result = result.filter((a) =>
        a.description?.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (typeFilter !== 'all') {
      result = result.filter((a) => a.action_type === typeFilter)
    }
    setFiltered(result)
  }, [search, typeFilter, activities])

  const types = Array.from(new Set(activities.map((a) => a.action_type)))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Activity className="w-8 h-8 text-orange-600" />
          የማናጀር እንቅስቃሴ ሙሉ ሎግ
        </h1>
        <p className="text-gray-500 mt-1">ሁሉም እንቅስቃሴዎች በዝርዝር</p>
      </div>

      <Card className="p-4 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="ፈልግ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ሁሉም ዓይነቶች</SelectItem>
              {types.map((t) => (
                <SelectItem key={t} value={t}>
                  {ACTION_LABELS[t] || t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="p-6">
        <p className="text-sm text-gray-500 mb-4">
          {filtered.length} ከ {activities.length} ውጤቶች
        </p>
        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-8">ምንም እንቅስቃሴ አልተገኘም</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((a) => (
              <div key={a.id} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">
                      {ACTION_LABELS[a.action_type] || a.action_type}
                    </Badge>
                    {a.role && <Badge variant="outline" className="text-xs">{a.role}</Badge>}
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
