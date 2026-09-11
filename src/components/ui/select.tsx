'use client'
import * as React from 'react'
import {cn} from '@/lib/utils'
type C={value:string;setValue:(v:string)=>void;open:boolean;setOpen:(v:boolean)=>void}
const Ctx=React.createContext<C>({value:'',setValue:()=>{},open:false,setOpen:()=>{}})
export function Select({value,defaultValue,onValueChange,children}:{value?:string;defaultValue?:string;onValueChange?:(v:string)=>void;children:React.ReactNode}){const [v,setV]=React.useState(value??defaultValue??'');const [open,setOpen]=React.useState(false);const val=value??v;const setValue=(x:string)=>{if(value===undefined)setV(x);onValueChange?.(x);setOpen(false)};return <Ctx.Provider value={{value:val,setValue,open,setOpen}}><div className="relative">{children}</div></Ctx.Provider>}
export const SelectTrigger=({className,children}:React.ButtonHTMLAttributes<HTMLButtonElement>)=>{const {open,setOpen}=React.useContext(Ctx);return <button type="button" className={cn('flex h-10 w-full items-center justify-between rounded-lg border bg-white px-3 text-sm',className)} onClick={()=>setOpen(!open)}>{children}</button>}
export const SelectContent=({className,children}:{className?:string;children:React.ReactNode})=>{const {open}=React.useContext(Ctx);if(!open)return null;return <div className={cn('absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white p-1 shadow-lg',className)}>{children}</div>}
export const SelectItem=({value,children}:React.ButtonHTMLAttributes<HTMLButtonElement>&{value:string})=>{const c=React.useContext(Ctx);return <button type="button" className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-orange-50" onClick={()=>c.setValue(value)}>{children}</button>}
export const SelectValue=({placeholder}:{placeholder?:string})=>{const {value}=React.useContext(Ctx);return <span>{value||placeholder||''}</span>}
