
import { Card } from '../components/card'
import { Carddeck } from '../components/carddeck'
import { useEffect, useRef, useState, type JSX } from 'react'
import "./gamepage.css"
import "../shared/socket"
import { socket } from '../shared/socket'
import { useconnected, useInRoomStatus } from "../App"
import {Profilepicture} from '../components/profilepicture'
/*
{
"phase":"playing",
"turn":"vDWZgnlICRaDOHM1AAAV",
"players":["vDWZgnlICRaDOHM1AAAV","pTEN1GtN3LUqd-PEAAAT"],
"deck":["AH","3H","5H","7H","8H","10H","JH","AD","2D","4D","5D","6D","9D","JD","QD","KD","AS","2S","3S","4S","5S","6S","7S","8S","10S","QS","KS","2C","3C","4C","5C","6C","7C","9C","10C","JC","QC","KC"],
"discard":[],
"hands":
{
"vDWZgnlICRaDOHM1AAAV":["8D","4H","6H","8C","7D","QH","JS"],
"pTEN1GtN3LUqd-PEAAAT":["9H","2H","3D","KH","AC","9S","10D"]
}
}

*/
export function Gamepage() {
    const [cardList, setCardList] = useState<JSX.Element[]>([])
    const [cardListOpponent, setoppoCardList] = useState<JSX.Element[]>([])
    const connected = useconnected;
    const { setRoomstatus } = useInRoomStatus();
    const [deckvisible, setDeckvisible] = useState<boolean>(true)
    const isinitialsetupdone=useRef(false);
    const [discardcardid,setdiscardcardid] = useState<string>("NOCARD");
    const updatebord=(data:string)=>
    {
          const username = localStorage.getItem("username");
           const statedata = JSON.parse(data);
               const discardedcards:string[] = [...statedata["discard"]]
                setdiscardcardid(discardedcards[discardedcards.length-1]);
             setCardList([]);
             setoppoCardList([]);

             for (const soc_id in statedata["hands"]) {
                if (soc_id === username) {
                    for (const cardname of statedata["hands"][`${username}`]) {
                        setCardList(prev => [...prev, <Card clickable={true} id={`${cardname}`} imgname={`${cardname}`}></Card>])
                    }
                }
                else {
                    for (const cardname of statedata["hands"][`${soc_id}`]) {
                       setoppoCardList(prev => [...prev, <Card clickable={false} id={`${cardname}`} imgname={`BK`}></Card>])
                    }
                }

            }
            for (const soc_id in statedata["hands"]) {
                  if (statedata["turn"] === username) {
                setDeckvisible(true);
            }
            else
            {
                setDeckvisible(false);
            }

             }
            console.log(data);
    }
    useEffect(() => {

        if (!connected) {
            setRoomstatus(false)
        }
        socket.emit("player_joined_room");
        socket.on("state_update",updatebord)
        socket.on("game_start",updatebord)
        return () => {
            socket.off("game_start",updatebord);
              socket.off("state_update",updatebord);
        }
    }, [connected])


    function drawfrompile() {
         //setCardList(prev => [...prev, <Card></Card>])
    }
    return (
        <>

            <div className='flex flex-col items-center justify-center min-h-screen '>
                <Card clickable={false} onclick={drawfrompile} className='drawpile'></Card>
                <Carddeck clickable={!deckvisible} deckisopen={deckvisible} className='carddeck_pos '>
                    {cardList.map(e => e)}
                </Carddeck>
                <Profilepicture highlight={!deckvisible}></Profilepicture>
                <Card clickable={false} imgname={discardcardid===undefined?'ET':discardcardid} id={discardcardid===undefined?'ET':discardcardid} onclick={()=>{}} className='discardpile 
                w-[150px] h-[300px]  
                md:w-[150px] h-[300px]  
                lg:w-[150px] h-[300px] 
                '></Card>
                <Profilepicture  highlight={deckvisible}></Profilepicture>
                <Carddeck clickable={false} deckisopen={!deckvisible} className={`carddeck_pos carddeck_oppo top-10`}>
                    {cardListOpponent.map(e => e)}
                </Carddeck>
            </div>
        </>)
}