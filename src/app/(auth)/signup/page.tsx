'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { UtensilsCrossed, Loader2 } from 'lucide-react'

export default function SignupPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'waiter',
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          name: form.name,
          phone: form.phone,
          role: form.role,
        },
      },
    })

    if (error) {
      toast.error('ስህተት', { description: error.message })
      setLoading(false)
      return
    }

    toast.success('ተመዝግቧል! 🎉', { description: 'አሁን መግባት ይችላሉ' })
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mb-4">
            <UtensilsCrossed className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold">አዲስ ተጠቃሚ ይመዝገቡ</h1>
          <p className="text-gray-500 mt-2">የሰራተኛ መለያ ይፍጠሩ</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <Label>ሙሉ ስም</Label>
            <Input value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="አበበ ከበደ" required />
          </div>

          <div>
            <Label>ኢሜይል</Label>
            <Input type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com" required />
          </div>

          <div>
            <Label>ስልክ ቁጥር</Label>
            <Input value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+251911234567" />
          </div>

          <div>
            <Label>ሚና</Label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">ባለቤት</SelectItem>
                <SelectItem value="manager">ማናጀር</SelectItem>
                <SelectItem value="waiter">ከስተመር</SelectItem>
                <SelectItem value="kitchen">ወጥ ቤት</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>የሚስጥር ቃል</Label>
            <Input type="password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={6} required />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />በመመዝገብ ላይ...</> : 'ተመዝገብ'}
          </Button>

          <p className="text-center text-sm text-gray-500">
            አካውንት አለህ?{' '}
            <Link href="/login" className="text-orange-600 font-medium">ግባ</Link>
          </p>
        </form>
      </Card>
    </div>
  )
}
