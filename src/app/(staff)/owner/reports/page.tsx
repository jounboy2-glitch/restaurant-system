'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Wallet, TrendingUp, TrendingDown, Percent,
  Download, Loader2, FileSpreadsheet, Send,
} from 'lucide-react'
import { formatETB } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from 'recharts'
import { toast } from 'sonner'
import { exportReportToExcel } from '@/lib/excel'

const COLORS = ['#f97316', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#14b8a6']

const METHOD_LABELS: Record<string, string> = {
  cash: 'ጥሬ ገንዘብ', telebirr: 'ቴሌብር', chapa: 'ቻፓ',
  card: 'ካርድ', bank: 'ባንክ', coupon: 'ኩፖን',
}

const CATEGORY_LABELS: Record<string, string> = {
  ingredients: 'ጥሬ እቃ', utilities: 'ኤሌክትሪክ/ውሃ',
  salary: 'ደመወዝ', rent: 'ኪራይ', equipment: 'እቃ ግዛ',
  marketing: 'ማስታወቂያ', other: 'ሌላ',
}

export default function ReportsPage() {
  const [period, setPeriod] = useState('today')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/reports?period=${period}`)
    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  useEffect(() => { load() }, [period])

  function exportCSV() {
    if (!data) return
    const rows = [
      ['ሪፖርት', period],
      ['ጠቅላላ ገቢ', data.summary.totalRevenue],
      ['ጠቅላላ ወጪ', data.summary.totalExpenses],
      ['ትርፍ', data.summary.profit],
      ['ማርጅን %', data.summary.margin.toFixed(2)],
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${period}-${Date.now()}.csv`
    a.click()
    toast.success('CSV ተወርሷል ✅')
  }

  function exportExcel() {
    if (!data) return
    exportReportToExcel(data)
    toast.success('Excel ተወርሷል ✅')
  }

  async function sendToTelegram() {
    if (!data) return
    setSending(true)
    try {
      // ወደ Telegram ላክ (በ cron API በኩል)
      const res = await fetch('/api/telegram/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period, report: data }),
      })
      if (res.ok) toast.success('ወደ ቴሌግራም ተልኳል ✅')
      else toast.error('መላክ አልተቻለም')
    } finally {
      setSending(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    )
  }

  const { summary, byMethod, byCategory } = data

  const pieMethod = Object.entries(byMethod).map(([k, v]) => ({
    name: METHOD_LABELS[k] || k, value: Number(v),
  }))

  const pieCategory = Object.entries(byCategory).map(([k, v]) => ({
    name: CATEGORY_LABELS[k] || k, value: Number(v),
  }))

  const barData = [
    { name: 'ገቢ', value: summary.totalRevenue, fill: '#10b981' },
    { name: 'ወጪ', value: summary.totalExpenses, fill: '#ef4444' },
    { name: 'ትርፍ', value: summary.profit, fill: '#f97316' },
  ]

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">ሪፖርቶች</h1>
          <p className="text-gray-500 mt-1">ሙሉ የፋይናንስ ትንተና</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={exportCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" /> CSV
          </Button>
          <Button onClick={exportExcel} variant="outline">
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
          </Button>
          <Button onClick={sendToTelegram} disabled={sending}>
            {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Telegram
          </Button>
        </div>
      </div>

      <Tabs value={period} onValueChange={setPeriod} className="mb-6">
        <TabsList>
          <TabsTrigger value="today">ዛሬ</TabsTrigger>
          <TabsTrigger value="week">ሳምንት</TabsTrigger>
          <TabsTrigger value="month">ወር</TabsTrigger>
          <TabsTrigger value="year">ዓመት</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">ጠቅላላ ገቢ</p>
              <p className="text-xl font-bold text-green-600">{formatETB(summary.totalRevenue)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">ጠቅላላ ወጪ</p>
              <p className="text-xl font-bold text-red-600">{formatETB(summary.totalExpenses)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${summary.profit >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
              <TrendingUp className={`w-6 h-6 ${summary.profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{summary.profit >= 0 ? 'ትርፍ' : 'ኪሳራ'}</p>
              <p className={`text-xl font-bold ${summary.profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatETB(Math.abs(summary.profit))}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Percent className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">ማርጅን</p>
              <p className="text-xl font-bold text-purple-600">{summary.margin.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="font-bold mb-4">ገቢ vs ወጪ vs ትርፍ</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(v: any) => formatETB(Number(v))} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold mb-4">በክፍያ አይነት</h3>
          {pieMethod.length === 0 ? (
            <p className="text-center text-gray-500 py-16">ምንም ውሂብ የለም</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieMethod} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {pieMethod.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => formatETB(Number(v))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-6 md:col-span-2">
          <h3 className="font-bold mb-4">የወጪ ምድቦች</h3>
          {pieCategory.length === 0 ? (
            <p className="text-center text-gray-500 py-16">ምንም ወጪ የለም</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pieCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={120} />
                <Tooltip formatter={(v: any) => formatETB(Number(v))} />
                <Bar dataKey="value" fill="#ef4444" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  )
}
