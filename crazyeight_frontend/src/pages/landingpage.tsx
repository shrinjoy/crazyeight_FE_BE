import "../fonts.css"
import { useState, type ReactNode } from "react"
import { Roomsearchjoin } from "../components/roomsearchjoin"
import {useconnected } from "../App"
interface props  {
children?:ReactNode
playercount:number|0
}

export function Landingpage({children,playercount}:props)
{
    const [roomsearchvisible,setRoomsearchvisiblity] = useState(false)
    const connected = useconnected();

    


    return(
        
    <>
        <label style={{ fontFamily: 'cartoonfont' }} className=" sm:text-sm md:text-sm lg:text-sm xl:text-xl  font-bold tracking-tight text-center">currently active players:{playercount}</label>
        <div className="w-dvw h-dvh gap-20 flex flex-col  items-center pt-16 md:pt-24 lg:pt-32">
        <label style={{ fontFamily: 'cartoonfont' }} className="text-5xl  sm:text-6xl  md:text-7xl   lg:text-8xl   xl:text-9xl   font-bold tracking-tight text-center">Crazy Eight</label>
            <div className="w-dvw h-dvh flex flex-col  items-center  gap-10">
            <button style={{ fontFamily: 'cartoonfont' }} className="bg-white  text-black  
            text-2xl xl:text-4xl font-bol px-10 py-5 rounded-3xl            
            shadow-[0_4px_0_0_#000] hover:shadow-[0_15px_0_0_#000] hover:-translate-y-1  
            active:translate-y-[2px] active:shadow-[0_4px_0_0_#000] 
            transition-all duration-100 border-4 border-black"  onClick={()=>{setRoomsearchvisiblity(true)}}>play</button>
            </div>
            <Roomsearchjoin visible={roomsearchvisible}></Roomsearchjoin>
          {children}
        </div></>)
      
      
}


