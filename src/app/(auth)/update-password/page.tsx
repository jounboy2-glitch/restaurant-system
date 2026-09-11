'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { Lock, Loader2 } from 'lucide-react'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) return toast.error('ቃላቱ አይመሳሰሉም')

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) return toast.error(error.message)

    toast.success('ተቀይሯል! 🎉')
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mb-4">
            <Lock className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold">አዲስ የሚስጥር ቃል</h1>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <Label>አዲስ የሚስጥር ቃል</Label>
            <Input type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6} required />
          </div>
          <div>
            <Label>አረጋግጥ</Label>
            <Input type="password" value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={6} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />በመቀየር ላይ...</> : 'ቀይር'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
