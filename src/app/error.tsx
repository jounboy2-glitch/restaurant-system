'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">ስህተት ተፈጥሯል</h2>
        <p className="text-gray-600 mb-6">እባክህ እንደገና ሞክር።</p>
        <Button onClick={reset}>እንደገና ሞክር</Button>
      </div>
    </div>
  )
}
