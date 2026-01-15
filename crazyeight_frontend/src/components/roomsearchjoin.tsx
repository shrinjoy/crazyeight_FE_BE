import { useState } from "react"
import "../fonts.css"
import { socket } from "../shared/socket"
interface props
{
  visible?:Boolean
}


type joinroomack ={
  ok: boolean, 
  roomid?:string,
  error?:string
}


async function joincreateroom(roomid:string)
{
 await socket.emit("create_room", { roomid:`${roomid}`} ,(res:joinroomack)=>{
  if(res.ok === true)
  {
    //chance scene to game scene
    alert(res.roomid);
  }
  else
  {
    alert(res.error);
  }
 });
}

export function Roomsearchjoin({visible}:props) {

  
  const [roomnametext,setRoomnametext] = useState<string>("")


    return (<div className={`fixed inset-0 flex items-center justify-center ${visible? `scale-100 opacity-100 translate-y-0`:`scale-0 opacity-0 translate-y-8`}`}><div className="w-[90%] max-w-2xl          
          min-h-[300px] h-7/12 
          bg-white rounded-2xl 
          shadow-2xl border-4 border-black
          overflow-y-auto              
          p-6 md:p-8
          flex  flex-col 
          ">
           
        <label style={{ fontFamily: 'cartoonfont' }} className="text-2xl  sm:text-2xl  md:text-4xl   lg:text-4xl   xl:text-4xl  text-black  font-bold tracking-tight text-center">Room Search</label>
    <div className="w-full max-w-md mx-auto px-4">
  <div className="flex border-2 border-black rounded-xl overflow-hidden">
    <input
      className="
        flex-1 min-w-0
        px-4 py-3.5
        text-base
        outline-none
        text-black
        placeholder:text-gray-500
      "
      onChange={(e)=>{setRoomnametext(e.target.value)}}
      placeholder="Room code..."
    />
    <button
      className="
        flex-shrink-0
        px-5 py-3.5
        bg-black text-white
        text-sm font-medium
        hover:bg-gray-800
        transition-colors
        min-w-[88px]
      "
      onClick={async ()=>{await joincreateroom(roomnametext)}}
    >
      Create
    </button>
  </div>
</div>
    </div></div>)

}