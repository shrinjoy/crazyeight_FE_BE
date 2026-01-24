
import { Card } from '../components/card'
import { Carddeck } from '../components/carddeck'
import { useEffect, useRef, useState, type JSX } from 'react'
import "./gamepage.css"
import "../shared/socket"
import { socket } from '../shared/socket'
import { useconnected, useInRoomStatus } from "../App"
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
  
    useEffect(() => {

        if (!connected) {
            setRoomstatus(false)
        }
        socket.emit("player_joined_room");
        const username = localStorage.getItem("username");
        const initgame = (data: string) => {
            if(isinitialsetupdone.current===false){
            const statedata = JSON.parse(data);
            console.log(data);
            console.log("game start");
            for (const soc_id in statedata["hands"]) {
                if (soc_id === username) {
                    for (const cardname of statedata["hands"][`${username}`]) {
                        setCardList(prev => [...prev, <Card id={`${cardname}`}></Card>])
                    }
                }
                else {
                    for (const cardname of statedata["hands"][`${soc_id}`]) {
                       setoppoCardList(prev => [...prev, <Card id={`${cardname}`}></Card>])
                    }
                }

            }
            
            if (statedata["turn"] === username) {
                setDeckvisible(true);
            }
            else
            {
                setDeckvisible(false);

            }
        }

            isinitialsetupdone.current = true;
        }

        socket.on("state_update",(data)=>{
               const statedata = JSON.parse(data);

             setCardList([]);
             setoppoCardList([]);

             for (const soc_id in statedata["hands"]) {
                if (soc_id === username) {
                    for (const cardname of statedata["hands"][`${username}`]) {
                        setCardList(prev => [...prev, <Card id={`${cardname}`}></Card>])
                    }
                }
                else {
                    for (const cardname of statedata["hands"][`${soc_id}`]) {
                       setoppoCardList(prev => [...prev, <Card id={`${cardname}`}></Card>])
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
        })

        
        socket.on("game_start", initgame)
        return () => {
            socket.off("game_start", initgame);
        }
    }, [connected])


    function drawfrompile() {
         setCardList(prev => [...prev, <Card></Card>])
    }
    return (
        <>

            <div className='flex flex-col items-center justify-center min-h-screen '>
                <Card onclick={drawfrompile} className='drawpile'></Card>
                <Carddeck clickable={deckvisible} deckisopen={deckvisible} className='carddeck_pos '>
                    {cardList.map(e => e)}
                </Carddeck>
                <Card onclick={()=>{}} className='discardpile 
                w-[150px] h-[300px]  
                
                md:w-[150px] h-[300px]  
                lg:w-[150px] h-[300px] 
                
                 bg-green-400 '></Card>

                <Carddeck clickable={false} deckisopen={!deckvisible} className={`carddeck_pos carddeck_oppo top-10`}>
                    {cardListOpponent.map(e => e)}
                </Carddeck>
            </div>
        </>)
}