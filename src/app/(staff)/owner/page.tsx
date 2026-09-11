'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Wallet, TrendingUp, Activity, Users, ShoppingBag } from 'lucide-react'
import { formatETB, formatDate } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#f97316', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b']

export default function OwnerPage() {
  const supabase = createClient()
  const [stats, setStats] = useState({
    revenue: 0, expenses: 0, orders: 0, customers: 0,
  })
  const [expenses, setExpenses] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [pay, exp, ord, act] = await Promise.all([
        supabase.from('payments').select('*').order('created_at', { ascending: false }),
        supabase.from('expenses').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('id, customer_name'),
        supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(100),
      ])

      const payData = pay.data || []
      const expData = exp.data || []

      setStats({
        revenue: payData.reduce((s, p) => s + Number(p.amount), 0),
        expenses: expData.reduce((s, e) => s + Number(e.amount), 0),
        orders: ord.data?.length || 0,
        customers: new Set(ord.data?.map(o => o.customer_name)).size,
      })

      setPayments(payData)
      setExpenses(expData)
      setActivities(act.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const profit = stats.revenue - stats.expenses
  const margin = stats.revenue > 0 ? (profit / stats.revenue) * 100 : 0

  const expenseByCategory = expenses.reduce((acc: any, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
    return acc
  }, {})

  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name, value: Number(value),
  }))

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">በመጫን ላይ...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">የባለቤት ዳሽቦርድ</h1>
        <p className="text-gray-500 mt-1">ሙሉ የሪስቶራንትዎን ሁኔታ ይከታተሉ</p>
      </header>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">ጠቅላላ ገቢ</p>
              <p className="text-2xl font-bold text-green-600">{formatETB(stats.revenue)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">ጠቅላላ ወጪ</p>
              <p className="text-2xl font-bold text-red-600">{formatETB(stats.expenses)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${profit >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
              <Activity className={`w-6 h-6 ${profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{profit >= 0 ? 'ትርፍ' : 'ኪሳራ'}</p>
              <p className={`text-2xl font-bold ${profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatETB(Math.abs(profit))}
              </p>
              <p className="text-xs text-gray-500">{margin.toFixed(1)}% ማርጅን</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">ትዕዛዞች</p>
              <p className="text-2xl font-bold">{stats.orders}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">አጠቃላይ</TabsTrigger>
          <TabsTrigger value="activity">የማናጀር እንቅስቃሴ</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-bold mb-4">የወጪ ምድብ</h3>
              {pieData.length === 0 ? (
                <p className="text-gray-500 text-center py-8">ምንም ወጪ የለም</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => formatETB(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-4">የገቢ vs ወጪ</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'ገቢ', value: stats.revenue },
                  { name: 'ወጪ', value: stats.expenses },
                  { name: 'ትርፍ', value: profit },
                ]}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(v: any) => formatETB(Number(v))} />
                  <Bar dataKey="value" fill="#f97316" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">የማናጀር እንቅስቃሴ ሙሉ ሎግ</h2>
            {activities.length === 0 ? (
              <p className="text-gray-500 text-center py-8">ምንም እንቅስቃሴ የለም</p>
            ) : (
              <div className="space-y-2">
                {activities.map((a) => (
                  <div key={a.id} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{a.description}</p>
                      <p className="text-xs text-gray-500">{a.role} • {formatDate(a.created_at)}</p>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
