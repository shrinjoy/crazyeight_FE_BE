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
        socket.on("create_room", async ({ roomid }, ack) => {
            if (!roomid || typeof roomid !== "string") {
                ack({ ok: false, error: "bad room name" });
                return;
            }
            const created = await redis.sadd("rooms", roomid);
            if (created === 0) {
                ack({ ok: false, error: "room with provided room name already exists" });
                return;
            }
            const initialState = {
                phase: "waiting",
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
        socket.on("disconnect", async () => {

            const count = await redis.decr("active:lobby:players");
            io.emit("playersinlobby", Math.max(count, 0));
        })
    })

}