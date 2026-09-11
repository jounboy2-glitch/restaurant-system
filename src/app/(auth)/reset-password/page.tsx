'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { KeyRound, Loader2, ArrowLeft } from 'lucide-react'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })

    setLoading(false)

    if (error) {
      toast.error('ስህተት', { description: error.message })
      return
    }

    setSent(true)
    toast.success('ኢሜይል ተልኳል! 📧')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <Card className="w-full max-w-md p-8">
        <Link href="/login" className="inline-flex items-center text-sm text-gray-500 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> ተመለስ
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mb-4">
            <KeyRound className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold">የሚስጥር ቃል ዳግም አስጀምር</h1>
          <p className="text-gray-500 mt-2">
            {sent ? 'ኢሜይልህን አረጋግጥ' : 'የኢሜይል አድራሻህን አስገባ'}
          </p>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">
              የዳግም ማስጀመሪያ አገናኝ ወደ <strong>{email}</strong> ተልኳል።
            </p>
            <Button variant="outline" onClick={() => setSent(false)}>እንደገና ሞክር</Button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <Label>ኢሜይል</Label>
              <Input type="email" value={email}
                onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />በመላክ ላይ...</> : 'አገናኝ ላክ'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
