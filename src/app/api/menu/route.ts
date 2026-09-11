import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const restaurantId = searchParams.get('restaurant_id')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select(`id, name, icon, display_order, menu_items (*)`)
    .eq('restaurant_id', restaurantId)
    .order('display_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ categories: data })
}
