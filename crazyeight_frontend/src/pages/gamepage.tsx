
import { Card } from '../components/card'
import { Carddeck } from '../components/carddeck'
import  { useEffect, useState, type JSX } from 'react'
import "./gamepage.css"
import "../shared/socket"
import { socket } from '../shared/socket'
import { useconnected,useInRoomStatus} from "../App"
export function Gamepage() {
    const [cardList, setCardList] = useState<JSX.Element[]>([])
    const connected = useconnected;
     const { setRoomstatus } = useInRoomStatus();
    useEffect(()=>{
        
        if(!connected)
        {
           setRoomstatus(false)
        }
        socket.emit("player_joined_room");
        socket.on("game_start",(data)=>{
            console.log(data);
        })
    },[connected])


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