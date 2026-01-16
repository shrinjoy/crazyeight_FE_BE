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
  const [inroom, setRoomstatus] = useState(true);
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
    socket.on("playersinlobby", (count: number) => { setLobbycount(count) });
    socket.on("connect", () => {
      setConnected(true);
    });
   
    socket.on("disconnect", () => {
      setConnected(false);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);

  return (
    <>
    
      <connectedcontext.Provider value={connected}>
        <Background>
          <roomStatus.Provider value={{inroom,setRoomstatus}}>
            {inroom?<Gamepage/>:<Landingpage playercount={lobbyCount}></Landingpage> }
          </roomStatus.Provider>
        </Background>
      </connectedcontext.Provider>
    </>
  )
}

export default App
