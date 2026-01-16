
import { Card } from '../components/card'
import { Carddeck } from '../components/carddeck'
import  { useState, type JSX } from 'react'
import "./gamepage.css"
export function Gamepage() {
    const [cardList, setCardList] = useState<JSX.Element[]>([])

    function drawfrompile() {
        setCardList(prev => [...prev, <Card></Card>])
    }
    return (
        <>

          <div className='flex flex-col'>
            <Card onclick={drawfrompile} className='drawpile'></Card>
            <Carddeck clickable={true} deckisopen={true} className='carddeck_pos '>
                {cardList.map(e => e)}
            </Carddeck>
             
            <Carddeck className={`carddeck_pos carddeck_oppo top-10`}>
                {cardList.map(e => e)}
            </Carddeck>
            </div>
        </>)
}