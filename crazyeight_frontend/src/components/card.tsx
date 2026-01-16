import type React from 'react'
import './card.css'
interface CardProps{
        className?:string
        style?:React.CSSProperties
        onclick?:()=>void
     
    }
export function Card({className="",style,onclick=()=>{}}:CardProps)
{
    return(<div style={style}  className={`${className} card `} onClick={(e)=>{onclick?.();e.stopPropagation()}} ></div>)
}