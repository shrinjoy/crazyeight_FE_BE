import { useState } from 'react'
import React from 'react';
import './carddeck.css'
import type { cardproperties } from './card';
interface carddeckproperties {
    children?: React.ReactNode; // Can be anything renderable
    className?: String;
    clickable?: boolean
    deckisopen?:boolean
}


export function Carddeck({ children, className = "", clickable = false ,deckisopen = false}: carddeckproperties) {
   
    const cardarray = React.Children.toArray(children);
    let mid = (cardarray.length - 1) / 2

    const fanarray = cardarray.map((child, index) => {
        if (React.isValidElement(child) == false) {
            return;
        }
        let distance = index - mid;




        const element = child as React.ReactElement<cardproperties>
const newchild = React.cloneElement(element, {
  className: `${element.props.className ?? ''} card_spawn ${
    deckisopen ? 'card_show' : 'card_hidden'
  }`,
  style: {
    ...(element.props.style || {}),
    '--offset': distance,
  } as React.CSSProperties,
  onclick:()=>{alert(element.props.id);}
})
        return newchild;
    })


    return (
        <>
            <div className={`deck ${className} ${deckisopen ? 'deck_show' : 'deck_hidden'}`} onClick={() => {
               
            }}>

                <div className='carddeck_list' >
                    {fanarray}
                </div>

            </div>
        </>
    )
}