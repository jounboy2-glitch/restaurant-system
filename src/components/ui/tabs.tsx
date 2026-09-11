'use client'
import * as React from 'react'
import {cn} from '@/lib/utils'
const Ctx=React.createContext<{value:string;setValue:(v:string)=>void}>({value:'',setValue:()=>{}})
export const Tabs=({defaultValue,value:controlled,onValueChange,className,children}:{defaultValue?:string;value?:string;onValueChange?:(v:string)=>void;className?:string;children:React.ReactNode})=>{const [v,setV]=React.useState(defaultValue??'');const value=controlled??v;const setValue=(x:string)=>{if(controlled===undefined)setV(x);onValueChange?.(x)};return <Ctx.Provider value={{value,setValue}}><div className={className}>{children}</div></Ctx.Provider>}
export const TabsList=({className,children}:{className?:string;children:React.ReactNode})=><div className={cn('inline-flex items-center gap-1 rounded-lg bg-gray-100 p-1',className)}>{children}</div>
export const TabsTrigger=({value,className,children}:{value:string;className?:string;children:React.ReactNode})=>{const c=React.useContext(Ctx);return <button type="button" className={cn('rounded-md px-3 py-2 text-sm font-medium',c.value===value?'bg-white shadow-sm':'text-gray-500',className)} onClick={()=>c.setValue(value)}>{children}</button>}
export const TabsContent=({value,className,children}:{value:string;className?:string;children:React.ReactNode})=>{const c=React.useContext(Ctx);return c.value===value?<div className={className}>{children}</div>:null}
