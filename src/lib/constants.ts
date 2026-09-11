export const APP_NAME = 'Restaurant System'

export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  WAITER: 'waiter',
  KITCHEN: 'kitchen',
} as const

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'በመጠበቅ ላይ',
  accepted: 'ተቀብሏል',
  preparing: 'በመዘጋጀት ላይ',
  ready: 'ተዘጋጅቷል',
  delivered: 'ደርሷል',
  completed: 'ተጠናቅቋል',
  cancelled: 'ተሰርዟል',
}

export const PAYMENT_METHODS = {
  cash: 'ጥሬ ገንዘብ',
  telebirr: 'ቴሌብር',
  chapa: 'ቻፓ',
  card: 'ካርድ',
  bank: 'ባንክ',
  coupon: 'ኩፖን',
} as const
