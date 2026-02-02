import { io, Socket } from "socket.io-client";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
export type socket_ack<T> =
    | { ok: true } & T
    | { ok: false; error: string };

export const socket: Socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket"],
    withCredentials: true
});