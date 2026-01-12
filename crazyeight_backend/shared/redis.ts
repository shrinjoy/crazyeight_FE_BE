import { Redis } from "ioredis";
import { error } from "node:console";
let redis: Redis | null = null;
export  function initredis():Redis{
    if (redis) return redis;
    redis =new Redis({
        host: "0.0.0.0",
        port: 6379,
        password:"12345",
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