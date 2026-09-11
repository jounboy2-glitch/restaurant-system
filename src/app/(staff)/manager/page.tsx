'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wallet, TrendingUp, Activity, ShoppingBag, Users, BarChart3, QrCode } from 'lucide-react'
import { formatETB, formatDate } from '@/lib/utils'

export default function ManagerPage() {
  const supabase = createClient()
  const router = useRouter()
  const [stats, setStats] = useState({
    revenue: 0, expenses: 0, orders: 0, staff: 0, tables: 0,
  })
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const [pay, exp, ord, users, tables, act] = await Promise.all([
        supabase.from('payments').select('amount').gte('created_at', today.toISOString()),
        supabase.from('expenses').select('amount').gte('created_at', today.toISOString()),
        supabase.from('orders').select('id').gte('created_at', today.toISOString()),
        supabase.from('users').select('id'),
        supabase.from('tables').select('id'),
        supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(5),
      ])

      setStats({
        revenue: (pay.data || []).reduce((s, p) => s + Number(p.amount), 0),
        expenses: (exp.data || []).reduce((s, e) => s + Number(e.amount), 0),
        orders: ord.data?.length || 0,
        staff: users.data?.length || 0,
        tables: tables.data?.length || 0,
      })
      setRecentActivities(act.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const profit = stats.revenue - stats.expenses

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">የማናጀር ዳሽቦርድ</h1>
        <p className="text-gray-500 mt-1">የዛሬ ማጠቃለያ</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">የዛሬ ገቢ</p>
              <p className="text-xl font-bold text-green-600">{formatETB(stats.revenue)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">የዛሬ ወጪ</p>
              <p className="text-xl font-bold text-red-600">{formatETB(stats.expenses)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${profit >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
              <Activity className={`w-6 h-6 ${profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{profit >= 0 ? 'ትርፍ' : 'ኪሳራ'}</p>
              <p className={`text-xl font-bold ${profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatETB(Math.abs(profit))}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">የዛሬ ትዕዛዞች</p>
              <p className="text-xl font-bold">{stats.orders}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Button variant="outline" className="h-20 flex-col gap-2"
          onClick={() => router.push('/manager/tables')}>
          <QrCode className="w-6 h-6" />
          QR Codes
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2"
          onClick={() => router.push('/manager/staff')}>
          <Users className="w-6 h-6" />
          ሰራተኞች ({stats.staff})
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2"
          onClick={() => router.push('/manager/expenses')}>
          <Wallet className="w-6 h-6" />
          ወጪ መዝግብ
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2"
          onClick={() => router.push('/owner/reports')}>
          <BarChart3 className="w-6 h-6" />
          ሪፖርቶች
        </Button>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">የቅርብ እንቅስቃሴዎች</h2>
          <Button variant="ghost" size="sm" onClick={() => router.push('/manager/activity')}>
            ሁሉንም ተመልከት →
          </Button>
        </div>
        {recentActivities.length === 0 ? (
          <p className="text-gray-500 text-center py-4">ምንም እንቅስቃሴ የለም</p>
        ) : (
          <div className="space-y-2">
            {recentActivities.map((a) => (
              <div key={a.id} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{a.description}</p>
                  <p className="text-xs text-gray-500">{formatDate(a.created_at)}</p>
                </div>
                {a.amount && (
                  <p className="font-bold text-red-600">{formatETB(a.amount)}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
