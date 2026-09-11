'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Clock, PlayCircle, StopCircle, Loader2, Wallet, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { formatETB, formatDate } from '@/lib/utils'

export default function ShiftPage() {
  const supabase = createClient()
  const [shift, setShift] = useState<any>(null)
  const [pastShifts, setPastShifts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actualTotal, setActualTotal] = useState('')
  const [closeDialog, setCloseDialog] = useState(false)

  async function load() {
    const res = await fetch('/api/shifts')
    const { shift } = await res.json()
    setShift(shift)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: past } = await supabase
        .from('shifts')
        .select('*')
        .eq('waiter_id', user.id)
        .eq('status', 'closed')
        .order('end_time', { ascending: false })
        .limit(10)
      setPastShifts(past || [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function openShift() {
    const res = await fetch('/api/shifts', { method: 'POST' })
    const data = await res.json()
    if (data.shift) {
      toast.success('ሽፍት ተከፍቷል ✅')
      load()
    }
  }

  async function closeShift() {
    if (!actualTotal) return toast.error('የተቀበልከውን ብር አስገባ')

    const res = await fetch('/api/shifts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shift_id: shift.id,
        actual_total: parseFloat(actualTotal),
      }),
    })

    if (res.ok) {
      toast.success('ሽፍት ተዘግቷል ✅')
      setCloseDialog(false)
      setActualTotal('')
      load()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Clock className="w-8 h-8 text-orange-600" />
        የሽፍት ማስተዳደር
      </h1>

      {/* የአሁን ሽፍት */}
      {shift ? (
        <Card className="p-6 mb-8 border-2 border-green-200 bg-green-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <h2 className="text-xl font-bold">ሽፍት ክፍት ነው</h2>
            </div>
            <Badge className="bg-green-600">ንቁ</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-3 rounded-lg">
              <p className="text-xs text-gray-500">ጥሬ ገንዘብ</p>
              <p className="text-xl font-bold">{formatETB(shift.total_cash)}</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="text-xs text-gray-500">ቴሌብር</p>
              <p className="text-xl font-bold">{formatETB(shift.total_telebirr)}</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="text-xs text-gray-500">ቻፓ</p>
              <p className="text-xl font-bold">{formatETB(shift.total_chapa)}</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="text-xs text-gray-500">ተጠባባቂ</p>
              <p className="text-xl font-bold text-orange-600">{formatETB(shift.expected_total)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <span>ጀምሯል: {formatDate(shift.start_time)}</span>
          </div>

          <Dialog open={closeDialog} onOpenChange={setCloseDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <StopCircle className="w-4 h-4 mr-2" />
                ሽፍት ዘጋ
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ሽፍት መዝጊያ</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">የተጠበቀ ጠቅላላ</p>
                  <p className="text-2xl font-bold">{formatETB(shift.expected_total)}</p>
                </div>
                <div>
                  <Label>የተቀበልከው ትክክለኛ ብር</Label>
                  <Input
                    type="number"
                    value={actualTotal}
                    onChange={(e) => setActualTotal(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                {actualTotal && (
                  <div className={`p-3 rounded-lg ${
                    Math.abs(parseFloat(actualTotal) - shift.expected_total) < 0.01
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}>
                    <p className="text-sm">ልዩነት:</p>
                    <p className="font-bold">
                      {formatETB(parseFloat(actualTotal) - shift.expected_total)}
                    </p>
                  </div>
                )}
                <Button onClick={closeShift} className="w-full">
                  አረጋግጥ እና ዘጋ
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Card>
      ) : (
        <Card className="p-8 mb-8 text-center">
          <PlayCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold mb-2">ሽፍት አልተከፈተም</h2>
          <p className="text-gray-500 mb-6">ስራ ለመጀመር ሽፍት ይክፈቱ</p>
          <Button onClick={openShift} size="lg">
            <PlayCircle className="w-5 h-5 mr-2" />
            ሽፍት ክፈት
          </Button>
        </Card>
      )}

      {/* ያለፉ ሽፍቶች */}
      <h2 className="text-xl font-bold mb-4">ያለፉ ሽፍቶች</h2>
      <div className="space-y-3">
        {pastShifts.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">ምንም ሽፍት የለም</Card>
        ) : (
          pastShifts.map((s) => (
            <Card key={s.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-500">{formatDate(s.start_time)}</p>
                  <p className="text-xs text-gray-400">→ {formatDate(s.end_time)}</p>
                </div>
                {Math.abs(Number(s.difference)) < 0.01 ? (
                  <Badge className="bg-green-600">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> ተስማሚ
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    ልዩነት: {formatETB(s.difference)}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">የተጠበቀ</p>
                  <p className="font-bold">{formatETB(s.expected_total)}</p>
                </div>
                <div>
                  <p className="text-gray-500">የተመዘገበ</p>
                  <p className="font-bold">{formatETB(s.actual_total)}</p>
                </div>
                <div>
                  <p className="text-gray-500">ልዩነት</p>
                  <p className={`font-bold ${
                    Math.abs(Number(s.difference)) < 0.01 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatETB(s.difference)}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
