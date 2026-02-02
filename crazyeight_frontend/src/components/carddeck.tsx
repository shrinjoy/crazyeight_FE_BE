import { useEffect, useState } from 'react'
import React from 'react';
import './carddeck.css'
import type { cardproperties } from './card';
import {socket} from "../shared/socket";

interface carddeckproperties {
    children?: React.ReactNode;
    className?: String;
    clickable?: boolean
    deckisopen?: boolean
}

export function Carddeck({ children, className = "", deckisopen = false }: carddeckproperties) {

    const [highlightcardid, setHighlightedCardId] = useState<string | null>(null);

    function mouse_select_event(id?:string) {
        const username = localStorage.getItem("username");
        if(highlightcardid === id){
            //spawn card
            console.log("card spawn");
            socket.emit("card_spawn",{username:username,data:id})
        }
        else
        {

        console.log("card selected"+id);
       
        socket.emit("card_selected",{username:username,data:id});
        setHighlightedCardId(id || null); 
        }
    }

    const cardarray = React.Children.toArray(children);
    let mid = (cardarray.length - 1) / 2

    const fanarray = cardarray.map((child, index) => {
        if (React.isValidElement(child) == false) {
            return;
        }
        let distance = index - mid;

        const element = child as React.ReactElement<cardproperties>
        
       
        const iscardhighlighted = element.props.id === highlightcardid;
        
        const newchild = React.cloneElement(element, {
            className: `${element.props.className ?? ''} card_spawn ${deckisopen ? 'card_show' : 'card_hidden'} ${iscardhighlighted ? 'card_mdown' : 'card_mup'}`,
            style: {
                ...(element.props.style || {}),
                '--offset': distance,
            } as React.CSSProperties,
            onclick: () => {mouse_select_event(element.props.id)},
            onMouseleave: () => {mouse_select_event()}
        })
        return newchild;
    })
    
    useEffect(() => {
        const highlighthandle = (data: string) => {
            console.log("card selected " + data)
            setHighlightedCardId(data); 
        }   

        socket.on("highlight_card", highlighthandle);

        return () => {
            socket.off("highlight_card", highlighthandle)
        };
    }, []) 

    return (
        <>
            <div className={`deck ${className} ${deckisopen ? 'deck_show' : 'deck_hidden'}`}>
                <div className='carddeck_list'>
                    {fanarray}
                </div>
            </div>
        </>
    )
}