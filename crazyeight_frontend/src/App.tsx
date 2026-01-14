import './App.css'
import { Landingpage } from './pages/landingpage'
import { Background } from './components/background'
import { useEffect, useState } from 'react'
import {socket,type socket_ack} from './shared/socket'
type lobbycount_ack = socket_ack<{ playercount: number }>;
function App() {
  const [lobbyCount, setLobbyCount] = useState(0);
  const [connected, setConnected] = useState(false);
     useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }
        socket.on("playersinlobby",(count: number)=>{setLobbyCount(count)});
        socket.on("connect", () => {
          
        });
        socket.on("playersinlobby",()=>{})
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
    <Background>
     <Landingpage playercount={lobbyCount}></Landingpage>
     </Background>
    </>
  )
}

export default App
