import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import MenuClient from './menu-client'

export default async function MenuPage({
  params,
}: {
  params: Promise<{ tableId: string }>
}) {
  const { tableId } = await params
  const supabase = await createClient()

  const { data: table } = await supabase
    .from('tables')
    .select(`*, branches (restaurant_id, restaurants (id, name, logo))`)
    .eq('id', tableId)
    .single()

  if (!table) notFound()

  const restaurantId = (table.branches as any).restaurant_id

  const { data: categories } = await supabase
    .from('categories')
    .select(`id, name, icon, display_order, menu_items (*)`)
    .eq('restaurant_id', restaurantId)
    .order('display_order')

  return (
    <MenuClient
      table={table}
      categories={categories || []}
      restaurant={(table.branches as any).restaurants}
    />
  )
}
