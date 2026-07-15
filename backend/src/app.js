import express from "express";
import mongoose from "mongoose";
import { createServer } from "node:http";
import {Server} from "socket.io";
import cors from "cors";

import connectToSocket from "./controllers/socketManager.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({ limit:"40kb", extended: true }));

app.set("port",(process.env.PORT || 8000));

app.get("/",(req,res)=>{
    res.send("Hello World");
});

const start = async() => {
    server.listen(8000,()=>{
        console.log("Server is running on port 8000");
    });
    const url = "mongodb+srv://rawatpiyush2023_db_user:ruUfiEmt62oOOpfB@zoomclone.vhn1oyn.mongodb.net/?appName=ZoomClone";
    await mongoose.connect(url)
    .then(()=>{
        console.log("Connected to MongoDB");
    })
    .catch((err)=>{
        console.log("Error connecting to MongoDB",err);
    });
    
}

start();