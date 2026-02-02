
import { Card } from '../components/card'
import { Carddeck } from '../components/carddeck'
import { useEffect, useState, type JSX } from 'react'
import "./gamepage.css"
import "../shared/socket"
import { socket } from '../shared/socket'
import { useconnected, useInRoomStatus} from "../App"
import { Profilepicture } from '../components/profilepicture'
import { Winlosspage } from '../components/winlosspage'

import 'reactjs-popup/dist/index.css';
import { ToastContainer, toast } from 'react-toastify';

export function Gamepage() {
    const [cardList, setCardList] = useState<JSX.Element[]>([])
    const [cardListOpponent, setoppoCardList] = useState<JSX.Element[]>([])
    const connected = useconnected;
    const { setRoomstatus } = useInRoomStatus();
    const [deckvisible, setDeckvisible] = useState<boolean>(true)
    
    const [discardcardid, setdiscardcardid] = useState<string>("NOCARD");
    const [isgamedone, setGamedone] = useState<boolean>(false);
    const [iswinner, setWinner] = useState<boolean>(false);

    const updatebord = (data: string) => {
        const username = localStorage.getItem("username");
        const statedata = JSON.parse(data);
        const discardedcards: string[] = [...statedata["discard"]]
        setdiscardcardid(discardedcards[discardedcards.length - 1]);
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
            else {
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
        socket.on("state_update", updatebord)
        socket.on("game_start", updatebord)
        const gameend = (data: { winner: string }) => {
            setGamedone(true);

            const username = localStorage.getItem("username");

            if (username === data.winner) {
                setWinner(true);
               
            }
            else {
                setWinner(false);
                

            }
        }
        socket.on("error_message",(data)=>{
            toast.dismiss()
            toast(`${data.message}`, { autoClose: 1500 });
        })
        socket.on("game_end", gameend)
        return () => {
            socket.off("game_start", updatebord);
            socket.off("state_update", updatebord);
            socket.off("game_end", gameend);
        }
    }, [connected])


    function drawfrompile() {

        
        const username = localStorage.getItem("username");
        socket.emit("draw_a_card", { username });
        console.log("called draw a card")

    }
    return (
        <>

            <div className='flex flex-col items-center justify-center min-h-screen '>
                 <ToastContainer autoClose={1500} />
                <button onClick={() => {
                    socket.emit("game_disconnect")
                    setRoomstatus(false);
                }} className='fixed left-0 top-0 bg-red-500 m-3 pl-4 pr-4 shadow-[2px_2px_0_0_#000] rounded-3xl p-[10px] active:translate-y-[2px] active:shadow-[0_0px_0_0_#000] z-50'>
                    leave
                </button>   {isgamedone ? <Winlosspage youwon={iswinner}></Winlosspage> : <></>}
                <Card clickable={true} onclick={drawfrompile} className='drawpile z-2000'></Card>
                <Carddeck clickable={!deckvisible} deckisopen={deckvisible} className='carddeck_pos '>
                    {cardList.map(e => e)}
                </Carddeck>
                <Profilepicture highlight={!deckvisible}></Profilepicture>
                <Card clickable={false} imgname={discardcardid === undefined ? 'ET' : discardcardid} id={discardcardid === undefined ? 'ET' : discardcardid} onclick={() => { }} className='discardpile 
                w-[150px] h-[300px]  
                md:w-[150px] h-[300px]  
                lg:w-[150px] h-[300px] 
                '></Card>
                <Profilepicture highlight={deckvisible}></Profilepicture>
                <Carddeck clickable={false} deckisopen={!deckvisible} className={`carddeck_pos carddeck_oppo top-10`}>
                    {cardListOpponent.map(e => e)}
                </Carddeck>
            </div>
        </>)
}