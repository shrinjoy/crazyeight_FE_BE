import express from "express"
import { createServer } from "http"
import { initsocketio } from "./shared/socket.js";

import { hostname } from "os";
const app = express();
const httpserver = createServer();
initsocketio(httpserver);


httpserver.listen(3000,"127.0.0.1",() => {console.log("backend server is running ")});