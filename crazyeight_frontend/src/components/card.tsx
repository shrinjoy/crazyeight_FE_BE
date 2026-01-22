import type React from 'react'
import './card.css'
export interface cardproperties{
        className?:string,
        id?:string
        style?:React.CSSProperties
        onclick?:()=>void
     
    }
export function Card({className="",id,style,onclick=()=>{}}:cardproperties)
{
    
    return(<div style={style} id={`${id}`} className={`${className} card `} onMouseDown={()=>{onclick?.();}} onClick={(e)=>{e.stopPropagation()}} ></div>)
}