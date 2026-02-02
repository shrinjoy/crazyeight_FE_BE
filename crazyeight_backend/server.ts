import express from "express"
import dotenv from 'dotenv'
import { createServer } from "http"
dotenv.config({ path: './.env' })
import { initsocketio } from "./shared/socket.js";
import { roomservice } from "./services/room.js";
import { gamelogic } from "./services/gamelogic.js";
const app = express();
const httpserver = createServer();
initsocketio(httpserver);
roomservice();
gamelogic();
httpserver.listen(Number(process.env.port),"0.0.0.0",() => {console.log("backend server is running ")});