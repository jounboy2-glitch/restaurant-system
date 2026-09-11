import * as React from 'react'
import { cn } from '@/lib/utils'
export const Button=React.forwardRef<HTMLButtonElement,React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?:string; size?:string}>(({className,variant='default',size='default',...p},ref)=>
<button ref={ref} className={cn('inline-flex items-center justify-center rounded-lg font-medium transition disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-orange-400',variant==='outline'?'border bg-white hover:bg-gray-50':'bg-orange-600 text-white hover:bg-orange-700',size==='icon'?'h-10 w-10':size==='lg'?'h-12 px-6 text-base':'h-10 px-4 text-sm',className)} {...p}/>)
Button.displayName='Button'
