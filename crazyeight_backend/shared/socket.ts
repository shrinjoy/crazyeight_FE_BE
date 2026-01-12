import { Server } from "socket.io"
import { type Server as httpserver } from "http"
import { getredis,initredis } from "./redis.js";
import { createAdapter } from '@socket.io/redis-adapter';
let ioserver: Server | null = null;
export async function initsocketio(httpserver: httpserver):Promise<Server>{
    if (ioserver) {
        return ioserver;
    }
    const pub = initredis();
    const sub = pub.duplicate();
    ioserver = new Server(httpserver, { cors: { origin: '*', methods: ['GET', 'POST'] } })
    ioserver.adapter(createAdapter(pub,sub));
    return ioserver;
}

export  function getsockioserver() {
    if(!ioserver)
    {
       throw new  Error("call initsocketio function first before trying to get io");
    }
    return ioserver;
}
