import * as React from 'react'
import { cn } from '@/lib/utils'
export const Badge=({className,variant='default',...p}:React.HTMLAttributes<HTMLSpanElement>&{variant?:string})=><span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',variant==='secondary'?'bg-gray-100 text-gray-700':'bg-orange-100 text-orange-700',className)} {...p}/>
