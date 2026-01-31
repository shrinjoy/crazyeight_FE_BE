import { getredis } from "../shared/redis.js";
import { getsockioserver } from "../shared/socket.js";
import { type roomstate, type phases, decklist, cardPoints } from "../shared/commontypes.js"
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








export function gamelogic() {
    const io = getsockioserver();
    const redis = getredis();
    async function getgamephase(roomid: string): Promise<phases | null> {
        const state = (await redis.hget(`room:${roomid}`, "phase")) as phases | null;
        return state;
    }
    async function setgamephase(roomid: string, phase: phases) {
        return await redis.hset(`room:${roomid}`, "phase", phase);
    }


    async function getsocketroomname(socketid: string): Promise<string | null> {
        return await redis.get(`socket:${socketid}:room`);
    }

    function shuffle<T>(array: T[]): T[] {
        const result = [...array]; // 
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
    io.on("connection", async (socket) => {

        socket.on("get_game_phase", async ({ roomid }, ack) => {
            const state = await getgamephase(roomid);
            ack({ ok: true, phase: state })
        })
        socket.on("player_joined_room", async () => {
            const roomname: string | null = await getsocketroomname(socket.id);
            if (roomname === null) {
                console.log({ ok: false, error: "room dont exist" })
                return
            }



            const state: phases | null = await getgamephase(roomname);
            if (state === null) {
                console.log({ ok: false, error: "phase is not know you are cooked bro :c" })
                return;
            }
            else {
                console.log(state);
                if (state === "waiting") {
                    const playercount: number = await redis.scard(`room:${roomname}:players`);


                    if (playercount === 2) {
                        //only one server should get hands on the setting up system or we gona have bad time 
                        //so we gona devise a lock mechanism 
                        const lock = await redis.set(`room:${roomname}:deck:started`, "1", "NX");
                        if (!lock) {
                            return;
                        }


                        await setgamephase(roomname, "playing");
                    }
                    else {
                        return;
                    }
                    const deck: string[] = shuffle(decklist);
                    const hands: Record<string, string[]> = {};
                    let players: string[] = await redis.smembers(`room:${roomname}:usernames`);
                    for (const player of players) {
                        hands[player] = [];
                        console.log("creating hand");
                    }
                    for (const player in hands) {
                        for (let i = 0; i < 7; i++) {
                            const cardname = deck.splice(Math.floor(Math.random() * deck.length), 1);
                            console.log("removing elements from Deck");

                            hands[player]?.push(...cardname);
                            console.log("adding cards to hands");

                        }

                    }
                    const gamestate = {
                        phase: "playing",
                        turn: players[0],
                        players: players,
                        deck: deck,
                        discard: [],
                        hands: hands
                    };
                    console.log("executing redis update for state sync");
                    await redis.set(`room:${roomname}:state`, JSON.stringify(gamestate));

                    const res = await redis.get(`room:${roomname}:state`);
                    if (playercount === 2) {
                        console.log("game start");
                        io.to(roomname).emit("game_start", res);
                    }
                }
                if (state === "playing") {

                    const res = await redis.get(`room:${roomname}:state`);
                    console.log("resuming game");
                    socket.emit("game_start", res);

                }
                if (state === "done") {

                    socket.leave(roomname);
                }
            }
        })
        async function isgameover(roomname): Promise<false | { winner: string }> {
            //there are 2 rules in crazy eight 
            //1 is if one players hand is empty they win 
            //2 is when any players hands reach 100 we will compare points of hand of each player who ever has least point will win 
            //we could have used the cached data sure but its better to avoid stale data for this check even tho i guess its not that stale but better be sure than not
            const state = await redis.get(`room:${roomname}:state`);
            if (!state) return false;
            const jsondata = JSON.parse(state);
            const players = await redis.smembers(`room:${roomname}:usernames`);
            //since we are sure the room num gona be 2 always and this function wont run unless the game is already in playing state
            if (players.length !== 2) return false;
            const p1 = players[0];
            const p2 = players[1];
            let p1Points = 0;
            let p2Points = 0;
            const p1Hand: string[] = jsondata.hands[p1] ?? [];
            const p2Hand: string[] = jsondata.hands[p2] ?? [];
            if (p1Hand.length === 0) return { winner: p1 };
            if (p2Hand.length === 0) return { winner: p2 };
            for (const card of p1Hand) {
                p1Points += cardPoints[card] ?? 0;
            }
            for (const card of p2Hand) {
                p2Points += cardPoints[card] ?? 0;
            }
            console.log(`point of p1 so far ${p1Points} and p2 ${[p2Points]}`);
            if (p1Points >= 100 || p2Points >= 100) {
                return {
                    winner: p1Points < p2Points ? p1 : p2
                };
            }
            return false;
        }


            socket.on("card_spawn", async ({ username, data }) => {
                //move this repeating bs to a single function check for sanity lol this is not worth repeating and this is important for basic auth 
                //wont be much of "authorative server" without this check would it be now ?
                const roomname: string | null = await getsocketroomname(socket.id);
                if (roomname === null) {
                    console.log({ ok: false, error: "room dont exist" })
                    return
                }

                const state: string = await redis.get(`room:${roomname}:state`);
                const jsondata: object = JSON.parse(state);
                const currentturn: string = jsondata["turn"];
                console.log(`room name ${roomname} current turn ${currentturn} : ${username} ${data}`);
                if (currentturn !== username) {
                    return;
                }
                let players: Set<string> = new Set(await redis.smembers(`room:${roomname}:usernames`));
                //we just delete the current player we will set the remaining player as next owner for the turn cause there can be only 2 players in this game
                players.delete(username);



                let discarddeck: Set<string> = new Set(jsondata["discard"]);
                let currentplayerhand: Set<string> = new Set(jsondata["hands"][username])
                if (currentplayerhand.has(data)) {

                    if (discarddeck.size > 0) {
                        let topdeck: string = [...discarddeck][discarddeck.size - 1];
                        //if the top deck is null we are pretty sure that this is the first turn 
                        if (topdeck !== null) {

                            let cardnumber = '';
                            let cardalphabet = '';
                            if (topdeck.length == 2) {
                                cardnumber = topdeck[0];
                                cardalphabet = topdeck[1];
                            }
                            else if (topdeck.length == 3) {
                                cardnumber = topdeck[0] + topdeck[1];
                                cardalphabet = topdeck[2];
                            }

                            let usercardnumber = '';
                            let usercardalphabet = '';
                            if (data.length == 2) {
                                usercardnumber = data[0];
                                usercardalphabet = data[1];
                            }
                            else if (data.length == 3) {
                                usercardnumber = data[0] + data[1];
                                usercardalphabet = data[2];
                            }
                            console.log(`TDN ${cardnumber} TDA ${cardalphabet} UDN ${usercardnumber} UDA ${usercardalphabet}`)
                            if (cardnumber === usercardnumber || usercardalphabet === cardalphabet || usercardnumber === "8") {
                                //legal move
                            }
                            else {
                                console.log("illegal move");
                                return;
                            }

                        }
                    }





                    currentplayerhand.delete(data);
                    jsondata["hands"][username] = [...currentplayerhand];
                    discarddeck.add(data);
                    jsondata["discard"] = [...discarddeck];
                    jsondata["turn"] = [...players][0];
                    await redis.set(`room:${roomname}:state`, JSON.stringify(jsondata));
                    console.log(JSON.stringify(await redis.get(`room:${roomname}:state`)))

                    io.to(roomname).emit("state_update", await redis.get(`room:${roomname}:state`))
                    //we will run game win state check here after all states on user side done updating

                    let gamestatuscheck:false|{winner:string} = await isgameover(roomname);
                    if(gamestatuscheck === false)
                    {
                        //do nothing game is not over yet 
                        
                    }
                    else
                    {
                        setgamephase(roomname,"done");
                        io.to(roomname).emit("game_end", gamestatuscheck)
                    }


                }
                else {
                    console.log("illegal move");
                    return;
                }









                //let players: string[] = await redis.smembers(`room:${roomname}:usernames`);


            })
            socket.on("draw_a_card", async ({ username }) => {
                console.log("draw a card");
                const roomname: string | null = await getsocketroomname(socket.id);
                if (roomname === null) {
                    console.log({ ok: false, error: "room dont exist" })
                    return
                }
                const state: string = await redis.get(`room:${roomname}:state`);
                const jsondata: object = JSON.parse(state);
                const currentturn: string = jsondata["turn"];
                if (currentturn !== username) {
                    return;
                }
                let players: Set<string> = new Set(await redis.smembers(`room:${roomname}:usernames`));
                //we just delete the current player we will set the remaining player as next owner for the turn cause there can be only 2 players in this game
                players.delete(username);


                let deck: Set<string> = new Set(jsondata["deck"]);
                if (deck.size > 0) {
                    let currentplayerhand: Set<string> = new Set(jsondata["hands"][username])
                    let cardtoadd = [...deck][deck.size - 1];
                    currentplayerhand.add(cardtoadd);
                    deck.delete(cardtoadd);
                    jsondata["hands"][username] = [...currentplayerhand];
                    jsondata["turn"] = [...players][0];
                    jsondata["deck"] = [...deck];
                    await redis.set(`room:${roomname}:state`, JSON.stringify(jsondata));
                    io.to(roomname).emit("state_update", await redis.get(`room:${roomname}:state`))
                    let gamestatuscheck:false|{winner:string} = await isgameover(roomname);
                    if(gamestatuscheck === false)
                    {
                        //do nothing game is not over yet 
                        
                    }
                    else
                    {
                        setgamephase(roomname,"done");
                        io.to(roomname).emit("game_status", gamestatuscheck)
                    }
                }
                else {
                    console.log("illelgal move");
                    return;
                }

            })

            socket.on("card_selected", async ({ username, data }) => {

                const roomname: string | null = await getsocketroomname(socket.id);
                if (roomname === null) {
                    console.log({ ok: false, error: "room dont exist" })
                    return
                }

                const state: string = await redis.get(`room:${roomname}:state`);
                const jsondata = JSON.parse(state);
                const currentturn = jsondata["turn"];


                if (currentturn !== username) {
                    return;
                }

                io.to(roomname).emit("highlight_card", data);
            })

        
    })

}