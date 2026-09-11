export type UserRole = 'owner' | 'admin' | 'manager' | 'waiter' | 'kitchen'

export type OrderStatus =
  | 'pending' | 'accepted' | 'preparing'
  | 'ready' | 'delivered' | 'completed' | 'cancelled'

export type PaymentMethod =
  | 'cash' | 'telebirr' | 'chapa' | 'card' | 'bank' | 'coupon'

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: UserRole
  restaurant_id?: string
  branch_id?: string
}

export interface MenuItem {
  id: string
  category_id: string
  name: string
  description?: string
  price: number
  cost_price?: number
  image?: string
  is_available: boolean
}

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}
