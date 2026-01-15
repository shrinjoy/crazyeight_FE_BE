import './App.css'
import { Landingpage } from './pages/landingpage'
import { Background } from './components/background'
import { createContext, useContext, useEffect, useState } from 'react'
import { socket } from './shared/socket'
const connectedcontext = createContext(false)
export const useconnected = () => useContext(connectedcontext);
function App() {
  const [lobbyCount, setLobbycount] = useState(0);
  const [connected, setConnected] = useState(false);

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
        <Landingpage playercount={lobbyCount}></Landingpage>
      </Background>
      </connectedcontext.Provider>
    </>
  )
}

export default App
