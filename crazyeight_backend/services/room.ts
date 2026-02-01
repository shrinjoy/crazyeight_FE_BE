/*
handels everything releated to 
-creation of room
-room list
*/

import { getredis } from "../shared/redis.js";
import { getsockioserver } from "../shared/socket.js";
export async function roomservice() {
    const io = getsockioserver();
    const redis = getredis();
    const current = Number(await redis.get("active:lobby:players")) || 0;
    await redis.set("active:lobby:players", 0);

    io.on("connection", async (socket) => {

        const count = await redis.incr("active:lobby:players");
        io.emit("playersinlobby", count);




        
        socket.on("create_room", async ({ roomid, username }, ack) => {


            //first check if the room name is even valid or not 
            if (!roomid || typeof roomid !== "string") {
                ack({ ok: false, error: "bad room name" });
                return;
            }


            //then we try creating a room
            const created = await redis.sadd("rooms", roomid);
            //failed to add room so a room exist
            //we will try to join
            if (created === 0) {
                //check player count 
                const playercount = await redis.scard(`room:${roomid}:players`);
                const roommeta = await redis.hgetall(`room:${roomid}`);
                //basically checks if there is a room meta data if yes we good to check 

                if (!roommeta || Object.keys(roommeta).length === 0) {
                    ack({ ok: false, error: "room data corrupted" });
                    return;
                }
                const maxPlayers = Number(roommeta.maxPlayers);
                if (playercount >= maxPlayers) {
                    ack({ ok: false, error: "room is full" });
                    return;
                }
                //we check the phase here 
                const gamephase =await redis.hget(`room:${roomid}`, "phase")
                   console.log(`this player trying to join room that is in ${gamephase} state ${username} `)
                //if the phase is waiting means we can allow adding more players
                if (gamephase === "waiting") {
                    //let the player join
                    //add to allowed username and players 
                    await redis.multi()
                        .sadd(`room:${roomid}:players`, socket.id)
                        .sadd(`room:${roomid}:usernames`, username)
                        .set(`socket:${socket.id}:room`, roomid)
                        .exec();
                    socket.join(roomid);
                    ack({ ok: true, "roomid": roomid });
                    socket.broadcast.emit("room_added", { playercount: playercount, name: roomid });
                    return;
                }
                //if not waitiing then that means a reconnect is going on there is ofc a 3rd state but that wont be happening as we will kill the room rightaway the game ends 
                //and like broadcast an event that game is over who won and handle rest of clean up right away 
                else if (gamephase === "playing") 
                {
                    //we will check if the user allowed to join this room
                    const alloweduser = await redis.sismember(`room:${roomid}:usernames`, username);
                    console.log(`this player trying to join room that is in ${gamephase} state ${username} ${alloweduser}`)
                    if (alloweduser === 0) {
                        ack({ ok: false, error: "you are not allowed to join this room" });
                        socket.leave(roomid);
                        return;

                    }
                    //allowed
                    else {
                        await redis.multi()
                            .sadd(`room:${roomid}:players`, socket.id)
                            .set(`socket:${socket.id}:room`, roomid)
                            .exec();
                        socket.join(roomid);
                        ack({ ok: true, "roomid": roomid });
                        socket.broadcast.emit("room_added", { playercount: playercount, name: roomid });
                        return;
                    }
                }

            }
            const initialState = {
                turn: null,
                players: [],
                deck: [],
                discard: []
            };

            await redis.multi()
                .hset(`room:${roomid}`, {
                    owner: socket.id,
                    createdAt: Date.now(),
                    maxPlayers: 2,
                    phase: "waiting"
                })
                .sadd(`room:${roomid}:players`, socket.id)
                .sadd(`room:${roomid}:usernames`, username)
                .set(`room:${roomid}:state`, JSON.stringify(initialState))
                .set(`socket:${socket.id}:room`, roomid)
                .exec();
            socket.join(roomid);
            ack({ ok: true, "roomid": roomid });
            socket.broadcast.emit("room_added", { playercount: 1, name: roomid });
        })
      
        socket.on("get_rooms", async (_, ack) => {

            try {
                const roomlist = await redis.smembers("rooms");
                if (roomlist.length === 0) {
                    ack({ ok: true, rooms: [] });
                    return;
                }
                const pipeline = redis.pipeline();
                roomlist.forEach((roomid) => {
                    pipeline.scard(`room:${roomid}:players`);
                });
                const results = await pipeline.exec();
                const rooms = roomlist.map((roomid, index) => ({
                    name: roomid,
                    playercount: results?.[index]?.[1] ?? 0
                }));

                ack({ ok: true, rooms });
            } catch (err) {
                ack({ ok: false, error: "failed to fetch rooms" });
            }

        })
        socket.on("get_total_player_count",
            async (_: unknown, ack?: (res: {
                ok: boolean;
                totalplayers?: number;
                error?: string;
            }) => void
            ) => {
                try {
                    const roomlist: string[] = await redis.smembers("rooms");

                    if (!roomlist || roomlist.length === 0) {
                        ack?.({ ok: true, totalplayers: 0 });
                        return;
                    }

                    const pipeline = redis.pipeline();
                    for (const roomid of roomlist) {
                        pipeline.scard(`room:${roomid}:players`);
                    }

                    const results = await pipeline.exec();

                    if (!results) {
                        ack?.({ ok: false, error: "redis pipeline failed" });
                        return;
                    }
                    let totalplayers = 0;
                    for (const [err, count] of results) {
                        if (err) continue;
                        if (typeof count === "number") {
                            totalplayers += count;
                        }
                    }

                    ack?.({ ok: true, totalplayers });
                } catch (err) {
                    ack?.({ ok: false, error: "failed to fetch total player count" });
                }
            }
        );
        socket.on("get_playersinlobby", async (_, ack) => {
            const count = Number(await redis.get("active:lobby:players")) || 0;
            console.log(count);

            ack?.({ ok: true, playercount: count });
        });
     
        socket.on("disconnecting", async (reason) => {

            const roomname: string | null = await redis.get(`socket:${socket.id}:room`);
            console.log(`trying to remove  player from room ${roomname}`);
            if (roomname !== null) {
                //we know room exists
                //we will update the player set now 

                await redis.srem(`room:${roomname}:players`, socket.id);
                console.log(`removed player from room ${roomname}`);

            }


        }
        )

        socket.on("disconnect", async () => {

            const count = await redis.decr("active:lobby:players");
            io.emit("playersinlobby", Math.max(count, 0));
            console.log("someone left lobby");

        })

    })

}