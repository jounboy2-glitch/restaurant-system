import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShieldAlert } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">ፍቃድ የለህም</h1>
        <p className="text-gray-600 mb-6">ይህን ገጽ ለማየት ፍቃድ የለህም።</p>
        <Link href="/"><Button>ወደ መነሻ</Button></Link>
      </div>
    </div>
  )
}
