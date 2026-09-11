'use client'
import * as React from 'react'
import {cn} from '@/lib/utils'
const Ctx=React.createContext<{open:boolean;setOpen:(v:boolean)=>void}>({open:false,setOpen:()=>{}})
export const DropdownMenu=({children}:{children:React.ReactNode})=>{const [open,setOpen]=React.useState(false);return <Ctx.Provider value={{open,setOpen}}><div className="relative">{children}</div></Ctx.Provider>}
export const DropdownMenuTrigger=({asChild,children}:{asChild?:boolean;children:React.ReactElement})=>{const {setOpen}=React.useContext(Ctx);return asChild?React.cloneElement(children,{onClick:(e:any)=>{children.props.onClick?.(e);setOpen(true)}}):<button onClick={()=>setOpen(true)}>{children}</button>}
export const DropdownMenuContent=({align='end',className,children}:{align?:string;className?:string;children:React.ReactNode})=>{const {open}=React.useContext(Ctx);if(!open)return null;return <div className={cn('absolute right-0 z-50 mt-2 rounded-lg border bg-white p-1 shadow-lg',className)}>{children}</div>}
export const DropdownMenuLabel=({children,className}:{children:React.ReactNode;className?:string})=><div className={cn('px-2 py-1.5 text-sm font-semibold',className)}>{children}</div>
export const DropdownMenuSeparator=()=> <div className="my-1 h-px bg-gray-100"/>
export const DropdownMenuItem=({onClick,className,children}:{onClick?:()=>void;className?:string;children:React.ReactNode})=>{const {setOpen}=React.useContext(Ctx);return <button type="button" className={cn('flex w-full items-center rounded px-2 py-2 text-left text-sm hover:bg-gray-50',className)} onClick={()=>{onClick?.();setOpen(false)}}>{children}</button>}
