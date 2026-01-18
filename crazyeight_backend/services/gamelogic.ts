import { getredis } from "../shared/redis.js";
import { getsockioserver } from "../shared/socket.js";
import { type roomstate, type phases, decklist } from "../../shared/commontypes.d.js"
import { ok } from "node:assert";
import { stat } from "node:fs";
import type { Socket } from "socket.io";



/*

{
  "phase": "waiting",
  "turn": "socket_123",
  "players": ["socket_123","socket_456"],
  "deck": ["3H","5C","KD"],
  "discard": ["7S"],
  "scores": {
    "socket_123": 0,
    "socket_456": 0
  },
  "hands": {
    "socket_123": ["3H","5C"],
    "socket_456": ["KD","7S"]
  }
}


HSET room:alpha
  owner "socket_123"
  createdAt "1705470000000"
  maxPlayers "2"
  phase "waiting"
  game "rummy"


SADD room:alpha:players socket_123 socket_456
SET socket:socket_123:room alpha
SET socket:socket_456:room alpha
HSET room:alpha phase playing
SET room:alpha:state "{\"phase\":\"playing\",\"turn\":\"socket_123\",\"players\":[\"socket_123\",\"socket_456\"],\"deck\":[\"3H\",\"5C\",\"KD\"],\"discard\":[]}"
room:<id>                 → metadata (hash)
room:<id>:players         → active sockets (set)
room:<id>:turn            → whose turn (string)
room:<id>:deck            → draw pile (list)
room:<id>:discard         → discard pile (list)
room:<id>:hand:<socket>   → each player's cards (list)
socket:<id>:room          → reverse lookup (string)

*/




const io = getsockioserver();
const redis = getredis();
async function getgamephase(roomid: string): Promise<phases | null> {
    const state = (await redis.get(`room:${roomid}:phase`)) as phases | null;
    return state;
}
async function setgamephase(roomid: string, phase: phases) {
    return await redis.set(`room:${roomid}:phase`,phase);
}


async function getsocketroomname(socketid: string): Promise<string | null> {
    return await redis.get(`socket:${socketid}:room`);
}







export async function roomservice() {

    io.on("connection", async (socket) => {

        socket.on("get_game_phase", async ({ roomid }, ack) => {
            const state = await getgamephase(roomid);
            ack({ ok: true, phase: state })
        })
        socket.on("player_connected", async (_, ack) => {
            const roomname: string | null = await getsocketroomname(socket.id);
            if (roomname === null) {
                ack({ ok: false, error: "room dont exist" })
                return
            }



            const state: phases | null = await getgamephase(roomname);
            if (state === null) {
                ack({ ok: false, error: "phase is not know you are cooked bro :c" })
                return;
            }
            else {
                console.log(state);
                if (state === "waiting") {
                    const playercount: number = await redis.scard(`room:${roomname}:players`);
                    //update game state to playing
                    if(await getgamephase(roomname) === "playing")
                    {
                        return
                    }
                    if (playercount === 2) {
                        //only one server should get hands on the setting up system or we gona have bad time 
                        //so we gona devise a lock mechanism 
                        const lock = await redis.set(`room:${roomname}:deck:started`,"1","NX");
                        if(!lock)
                        {
                            return;
                        }


                      await  setgamephase(roomname, "playing");
                    }
                    
                    //distribute cards and setup deck
                    //not shuffeling right now will later in future
                    const deck: string[] = [...decklist];
                    const hands: Record<string, string[]> = {};
                    let players:string[] =  await redis.smembers(`room:${roomname}:players`);
                    for (const player of players) {
                        hands[player] = [];
                    }
                    for (const player in hands) {
                        for(let i =0;i<7;i++)
                        {
                            const cardname = deck.splice(Math.floor(Math.random()*deck.length),1);
                            
                            hands[player]?.push(...cardname);

                        }

                    }
                    const pipeline = redis.pipeline();
                    pipeline.del(`room:${roomname}:deck`);
                    pipeline.rpush(`room:${roomname}:deck`,...deck);
                 
                    for (const player of players) {
                        pipeline.del(`room:${roomname}:hand:${player}`);
                        pipeline.rpush(`room:${roomname}:hand:${player}`, ...hands[player]!);
                    }
                    await pipeline.exec();
                    
                    const gamestate = await redis.get(`room:${roomname}:state`);

                    io.to(roomname).emit("game_start",gamestate);
                }
                if (state === "playing") {

                    //resume player logic goes here
                }
                if (state === "done") {
                    ack({ ok: false, error: "game is over and room is closing" })
                    socket.leave(roomname);
                }
            }
        })

    })

}