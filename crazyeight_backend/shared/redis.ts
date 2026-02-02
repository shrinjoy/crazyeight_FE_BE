import { Redis } from "ioredis";
import { error } from "node:console";
let redis: Redis | null = null;
export  function initredis():Redis{
    if (redis) return redis;
    console.log(`host: ${String(process.env.redis_url)},
        port: ${Number(process.env.redis_port)},
        username:${String(process.env.redis_username)},
        password:${String(process.env.redis_password)},
        maxRetriesPerRequest: null,
        enableReadyCheck: true`)
    redis =new Redis({
        host: String(process.env.redis_url),
        port: Number(process.env.redis_port),
        username:String(process.env.redis_username),
        password:String(process.env.redis_password),
        maxRetriesPerRequest: null,
        enableReadyCheck: true
    })
    redis.on("connect", () => {
        console.log("connected successfully to redis");
    })
    redis.on("error", (err) => {
        console.log("redis error:" + err);
    })
    return redis;
}
export function getredis(): Redis {
    if (!redis) {
        throw new Error("redis is not init call the initredis function first lol");
    }
    return redis;
}