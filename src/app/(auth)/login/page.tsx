'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { UtensilsCrossed, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error('የመግቢያ ስህተት', { description: error.message })
      setLoading(false)
      return
    }

    toast.success('እንኳን ደህና መጡ! 👋')

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single()

    const routes: Record<string, string> = {
      owner: '/owner',
      admin: '/manager',
      manager: '/manager',
      waiter: '/waiter',
      kitchen: '/kitchen',
    }

    router.push(routes[profile?.role || ''] || '/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mb-4">
            <UtensilsCrossed className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold">ወደ ሲስተሙ ይግቡ</h1>
          <p className="text-gray-500 mt-2">ለሰራተኞች እና ባለቤት ብቻ</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">ኢሜይል</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">የሚስጥር ቃል</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />በመግባት ላይ...</> : 'ግባ'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
