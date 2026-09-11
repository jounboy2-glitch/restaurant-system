import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-orange-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-2">ገጹ አልተገኘም</h2>
        <Link href="/">
          <Button>ወደ መነሻ ተመለስ</Button>
        </Link>
      </div>
    </div>
  )
}
