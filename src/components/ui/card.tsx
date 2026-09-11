import * as React from 'react'
import { cn } from '@/lib/utils'
export const Card=React.forwardRef<HTMLDivElement,React.HTMLAttributes<HTMLDivElement>>(({className,...p},ref)=><div ref={ref} className={cn('rounded-xl border bg-white shadow-sm',className)} {...p}/>)
Card.displayName='Card'
