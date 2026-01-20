import type React from 'react'
import './card.css'
interface CardProps{
        className?:string,
        id?:string
        style?:React.CSSProperties
        onclick?:()=>void
     
    }
export function Card({className="",id,style,onclick=()=>{}}:CardProps)
{
    return(<div style={style} id={`${id}`} className={`${className} card `} onClick={(e)=>{onclick?.();e.stopPropagation()}} ></div>)
}