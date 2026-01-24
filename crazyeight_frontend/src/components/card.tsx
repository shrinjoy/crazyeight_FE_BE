import type React from 'react'
import './card.css'
export interface cardproperties {
    className?: string,
    id?: string
    style?: React.CSSProperties
    onclick?: () => void,
    onMouseleave?: () => void
}
export function Card({ className = "", id, style, onclick = () => { }, onMouseleave = () => { } }: cardproperties) {

    return (<div style={style} id={`${id}`} className={`${className} card `} onMouseLeave={() => {
        onMouseleave?.();
    }} onMouseDown={() => { onclick?.(); }} onClick={(e) => { e.stopPropagation() }} ></div>)
}