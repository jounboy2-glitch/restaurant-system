'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Wallet, Plus, Loader2, TrendingDown } from 'lucide-react'
import { toast } from 'sonner'
import { formatETB, formatDate } from '@/lib/utils'

const CATEGORIES = [
  { value: 'ingredients', label: '🥬 ጥሬ እቃ' },
  { value: 'utilities', label: '💡 ኤሌክትሪክ/ውሃ' },
  { value: 'salary', label: '👥 ደመወዝ' },
  { value: 'rent', label: '🏠 ኪራይ' },
  { value: 'equipment', label: '📦 እቃ ግዢ' },
  { value: 'marketing', label: '📢 ማስታወቂያ' },
  { value: 'other', label: '🧾 ሌላ' },
]

export default function ExpensesPage() {
  const supabase = createClient()
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ category: 'ingredients', amount: '', description: '' })

  async function load() {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false })
    setExpenses(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function add(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(form.amount)
    if (!amount || amount <= 0) return toast.error('ትክክለኛ መጠን አስገባ')

    const { error } = await supabase.from('expenses').insert({
      category: form.category,
      amount,
      description: form.description,
    })

    if (error) return toast.error(error.message)

    // Activity log
    await supabase.from('activity_logs').insert({
      action_type: 'expense_add',
      entity: 'expense',
      amount,
      description: `${CATEGORIES.find(c => c.value === form.category)?.label}: ${form.description}`,
      role: 'manager',
    })

    toast.success('ወጪ ተመዝግቧል ✅')
    setForm({ category: 'ingredients', amount: '', description: '' })
    load()
  }

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const today = expenses
    .filter(e => new Date(e.created_at).toDateString() === new Date().toDateString())
    .reduce((s, e) => s + Number(e.amount), 0)

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
          <Wallet className="w-8 h-8 text-red-600" />
          ወጪዎች
        </h1>
        <p className="text-gray-500 mt-1">ሁሉንም ወጪዎች ይመዝግቡ እና ይከታተሉ</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">የዛሬ ወጪ</p>
              <p className="text-2xl font-bold text-red-600">{formatETB(today)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">ጠቅላላ ወጪ</p>
              <p className="text-2xl font-bold text-orange-600">{formatETB(total)}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" /> አዲስ ወጪ መዝግብ
        </h2>
        <form onSubmit={add} className="grid md:grid-cols-4 gap-4">
          <div>
            <Label>ምድብ</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>መጠን (ብር)</Label>
            <Input type="number" value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00" required />
          </div>
          <div>
            <Label>ማብራሪያ</Label>
            <Input value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="ለምሳሌ: 5 ኪሎ ዶሮ" />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full">መዝግብ</Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">ሁሉም ወጪዎች ({expenses.length})</h2>
        {expenses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">ምንም ወጪ የለም</p>
        ) : (
          <div className="space-y-2">
            {expenses.map((e) => (
              <div key={e.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{e.description || 'ያለ ማብራሪያ'}</p>
                  <p className="text-xs text-gray-500">
                    {CATEGORIES.find(c => c.value === e.category)?.label} • {formatDate(e.created_at)}
                  </p>
                </div>
                <p className="font-bold text-red-600">-{formatETB(e.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
