import './App.css'
import { Landingpage } from './pages/landingpage'
import { Background } from './components/background'
import { createContext, useContext, useEffect, useState } from 'react'
import { socket } from './shared/socket'
import { Gamepage } from './pages/gamepage'
const connectedcontext = createContext(false)
export const useconnected = () => useContext(connectedcontext);

const roomStatus = createContext<any>(null);
export const useInRoomStatus = () => useContext(roomStatus);
function App() {
  const [lobbyCount, setLobbycount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [inroom, setRoomstatus] = useState(false);
  useEffect(() => {
    if(localStorage.getItem("username")===null){
        const timestamp = Date.now().toString(36); 
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        localStorage.setItem("username",timestamp+randomSuffix)
    }
    else
    {
      console.log(localStorage.getItem("username"));
    }
    
    if (!socket.connected) {
      socket.connect();
    }
    socket.on("playersinlobby", (count: number) => { setLobbycount(count) });
    socket.on("connect", () => {
      setConnected(true);
    });
   
    socket.on("disconnect", () => {
      setConnected(false);
      setRoomstatus(false);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, [connected]);

  return (
    <>
    
      <connectedcontext.Provider value={connected}>
        <Background>
          <roomStatus.Provider value={{inroom,setRoomstatus}}>
            {inroom?<Gamepage/>:<Landingpage playercount={connected?lobbyCount:0}></Landingpage> }
          </roomStatus.Provider>
        </Background>
      </connectedcontext.Provider>
    </>
  )
}

export default App
