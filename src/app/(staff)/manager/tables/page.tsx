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
import { QrCode, Printer, Plus, Loader2, Copy } from 'lucide-react'
import { toast } from 'sonner'

export default function TablesPage() {
  const supabase = createClient()
  const [tables, setTables] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({})
  const [newNumber, setNewNumber] = useState('')
  const [newCapacity, setNewCapacity] = useState('4')
  const [dialogOpen, setDialogOpen] = useState(false)

  async function loadTables() {
    const { data } = await supabase
      .from('tables')
      .select('*')
      .order('table_number')
    setTables(data || [])
    setLoading(false)

    // QR codes ፍጠር
    const { generateQRCode } = await import('@/lib/qr')
    const codes: Record<string, string> = {}
    for (const t of data || []) {
      codes[t.id] = await generateQRCode(t.id, 300)
    }
    setQrCodes(codes)
  }

  useEffect(() => { loadTables() }, [])

  async function addTable(e: React.FormEvent) {
    e.preventDefault()
    const num = parseInt(newNumber)
    if (!num) return toast.error('ትክክለኛ ቁጥር አስገባ')

    // የመጀመሪያ branch
    const { data: branch } = await supabase.from('branches').select('id').limit(1).single()

    const { error } = await supabase.from('tables').insert({
      branch_id: branch?.id,
      table_number: num,
      capacity: parseInt(newCapacity),
    })

    if (error) return toast.error(error.message)

    toast.success('ጠረጴዛ ተጨምሯል')
    setNewNumber('')
    setNewCapacity('4')
    setDialogOpen(false)
    loadTables()
  }

  function printQR(table: any, qrData: string) {
    const win = window.open('', '_blank')
    if (!win) return

    win.document.write(`
      <html>
        <head>
          <title>ጠረጴዛ ${table.table_number} — QR</title>
          <style>
            body {
              font-family: system-ui, sans-serif;
              text-align: center;
              padding: 40px;
              margin: 0;
            }
            .card {
              border: 3px solid #f97316;
              border-radius: 24px;
              padding: 30px;
              display: inline-block;
              max-width: 400px;
            }
            h1 { font-size: 32px; margin: 0 0 8px; color: #ea580c; }
            h2 { font-size: 48px; margin: 0 0 20px; color: #111; }
            img { width: 300px; height: 300px; }
            p { font-size: 14px; color: #666; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>🍽️ Restaurant</h1>
            <h2>ጠረጴዛ ${table.table_number}</h2>
            <img src="${qrData}" />
            <p>ስካን አድርገው ሜኑ ይመልከቱ<br/>እና ትዕዛዝ ያስገቡ</p>
          </div>
          <script>window.onload = () => window.print()</script>
        </body>
      </html>
    `)
    win.document.close()
  }

  function copyLink(tableId: string) {
    const url = `${window.location.origin}/menu/${tableId}`
    navigator.clipboard.writeText(url)
    toast.success('አገናኝ ተቀድቷል')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">ጠረጴዛዎች እና QR Codes</h1>
          <p className="text-gray-500 mt-1">ለየጠረጴዛው QR Code ያመንጩ እና ያትሙ</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> ጠረጴዛ ጨምር</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>አዲስ ጠረጴዛ</DialogTitle>
            </DialogHeader>
            <form onSubmit={addTable} className="space-y-4">
              <div>
                <Label>የጠረጴዛ ቁጥር</Label>
                <Input type="number" value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)} required />
              </div>
              <div>
                <Label>አቅም (ሰዎች)</Label>
                <Input type="number" value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">ጨምር</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((table) => (
          <Card key={table.id} className="p-6 text-center">
            <Badge className="mb-3" variant={table.status === 'available' ? 'secondary' : 'default'}>
              {table.status === 'available' ? 'ነጻ' : 'ተይዟል'}
            </Badge>

            <h2 className="text-2xl font-bold mb-1">ጠረጴዛ {table.table_number}</h2>
            <p className="text-sm text-gray-500 mb-4">{table.capacity} ሰዎች</p>

            {qrCodes[table.id] && (
              <div className="bg-white p-3 rounded-xl border-2 border-orange-100 mb-4 inline-block">
                <img src={qrCodes[table.id]} alt={`QR ${table.table_number}`} className="w-48 h-48" />
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1"
                onClick={() => printQR(table, qrCodes[table.id])}>
                <Printer className="w-4 h-4 mr-1" /> አትም
              </Button>
              <Button variant="outline" size="sm" className="flex-1"
                onClick={() => copyLink(table.id)}>
                <Copy className="w-4 h-4 mr-1" /> አገናኝ
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-20">
          <QrCode className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">እስካሁን ጠረጴዛ የለም</p>
        </div>
      )}
    </div>
  )
}
