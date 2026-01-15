import { useEffect, useState } from "react"
import "../fonts.css"
import { socket } from "../shared/socket"
import { useconnected } from "../App"
interface props
{
  visible?:Boolean
}
type joinroom_ack ={
  ok: boolean, 
  roomid?:string,
  error?:string
}
type roomdata = {
   name: string,
  playercount: number|0
}
type roomack = {
  ok:boolean,
  rooms?:roomdata[],
  error?:string
}
function joincreateroom(roomid:string)
{
  socket.emit("create_room", { roomid:`${roomid}`} ,(res:joinroom_ack)=>{
    console.log(res);
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
  const connected = useconnected();
  const [roomlist,setRoomlist] = useState<roomdata[]>([]);
  function getrooms() {

    socket.emit("get_rooms", null, (res: roomack) => {
      console.log("room list");
      if (res.ok === true) {
        if (res.rooms != null) {
          setRoomlist(res.rooms);
        }
      }
      else {
        console.log(res.error);

      }

    })
  }
  useEffect(()=>{
    if(connected)
    {
      getrooms();
    }
    const onroomadded = () => getrooms();
    socket.on("room_added",onroomadded)
    return () => {
    socket.off("room_added",onroomadded);
  };
  },[connected])




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
      onClick={async ()=>{joincreateroom(roomnametext)}}
    >
      Create/Join
    </button>
    
  </div>
  <ul className="
    max-h-64
    overflow-y-auto
    border-t border-black
    mt-4
  ">
  {roomlist.map((room) => (
    <li className="
        flex-1 min-w-0
        px-4 py-3.5
        text-base
        outline-none
        text-black
        placeholder:text-gray-500
      " key={room.name}>
      {room.name} — {room.playercount}
    </li>
  ))}
</ul>
</div>
    </div></div>)

}