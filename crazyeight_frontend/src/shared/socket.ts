import { io, Socket } from "socket.io-client";
export type socket_ack<T> =
    | { ok: true } & T
    | { ok: false; error: string };

export const socket: Socket = io("http://localhost:3000", {
    autoConnect: false,
    transports: ["websocket"],
    withCredentials: true
});