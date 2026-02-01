import {socket} from '../shared/socket'
import {useInRoomStatus } from '../App'


interface winlosstate {
  youwon: boolean
}




export function Winlosspage({ youwon }: winlosstate) {
   const { setRoomstatus } = useInRoomStatus();


 function disconnect()
{
  socket.emit("game_disconnect")
  setRoomstatus(false);
}

  return (
    <div className="fixed bg-white border-2 w-[50%] h-[50%] rounded-2xl z-100 
                    flex flex-col items-center justify-center text-center gap-8 shadow-[0_10px_0_0_#000]">

      <label
        style={{ fontFamily: 'cartoonfont' }}
        className="
          text-black font-bold
          text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl
        "
      >
        {youwon ? "you won!!" : "you lost :c"}
      </label>

      <button
        style={{ fontFamily: 'cartoonfont' }}
        className="
          bg-white text-black font-bold
          text-xl sm:text-2xl md:text-3xl
          px-8 py-4 rounded-3xl
          border-4 border-black
          shadow-[0_4px_0_0_#000]
          hover:shadow-[0_12px_0_0_#000] hover:-translate-y-1
          active:translate-y-[2px] active:shadow-[0_4px_0_0_#000]
          transition-all duration-100
        "
        onClick={disconnect}
      >
        Exit
      </button>
    </div>
  )
}
