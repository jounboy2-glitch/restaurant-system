'use client'
import * as React from 'react'
import {cn} from '@/lib/utils'
const Ctx=React.createContext<{open:boolean;setOpen:(v:boolean)=>void}>({open:false,setOpen:()=>{}})
export function Dialog({open:controlled,onOpenChange,children}:{open?:boolean;onOpenChange?:(v:boolean)=>void;children:React.ReactNode}){
 const [local,setLocal]=React.useState(false); const open=controlled??local; const setOpen=(v:boolean)=>{onOpenChange?.(v);if(controlled===undefined)setLocal(v)}
 return <Ctx.Provider value={{open,setOpen}}>{children}</Ctx.Provider>
}
export function DialogTrigger({asChild,children}:{asChild?:boolean;children:React.ReactElement}){const {setOpen}=React.useContext(Ctx); return asChild?React.cloneElement(children as any,{onClick:(e:any)=>{children.props.onClick?.(e);setOpen(true)}}):<button onClick={()=>setOpen(true)}>{children}</button>}
export function DialogContent({className,children}:{className?:string;children:React.ReactNode}){const {open,setOpen}=React.useContext(Ctx);if(!open)return null;return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={()=>setOpen(false)}><div className={cn('max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl bg-white p-6 shadow-xl',className)} onMouseDown={e=>e.stopPropagation()}>{children}</div></div>}
export const DialogHeader=({className,children}:{className?:string;children:React.ReactNode})=><div className={cn('mb-4',className)}>{children}</div>
export const DialogTitle=({className,children}:{className?:string;children:React.ReactNode})=><h2 className={cn('text-xl font-bold',className)}>{children}</h2>
