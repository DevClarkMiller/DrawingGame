import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import loadEnv from '../lib/loadEnv';
import http from 'http';
import { Server } from 'socket.io';
import { randomUUID } from 'crypto';
import randomName from '../lib/randomName';

loadEnv();
const PORT: number = parseInt(process.env.PORT as string) || 5170;
const CLIENT_URL: string = process.env.CLIENT_URL as string || "http://localhost:3000";
const ROOM_ID_LEN: number = parseInt(process.env.ROOM_ID_LEN as string) || 12;

const app: Application = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

type Room = {
    id: string;
    url: string;
}

type JoinedUser = {
    name?: string; // If not provided, a random one will be generated
    roomId: string;
}

// Change to use redis in production
// The value is the hosts name
let rooms: Map<string, string> = new Map<string, string>();

io.on('connection', (socket) =>{
    console.log("A user connected");

    socket.on('createRoom', (hostName: string) =>{
        const roomId = randomUUID().substring(0, ROOM_ID_LEN);
        const newRoom: Room = {id: roomId, url: `${CLIENT_URL}/joinRoom?roomId=${roomId}`};

        console.log(`CREATING ROOM ${roomId}`);
        rooms.set(roomId, hostName);

        socket.join(roomId);
        io.to(roomId).emit("userJoined", `${randomName()} has joined!`);
        socket.emit("createdRoom", newRoom);
    });

    socket.on('joinRoom', (joinedUser: JoinedUser) =>{
        if (!rooms.has(joinedUser.roomId)){
            socket.emit("roomNotFound", `${joinedUser.roomId} was not found`);
            return;
        }

        // Give the user a random name if they somehow don't have one
        if (!joinedUser.name)
            joinedUser.name = randomName();
        
        console.log("A user is joining!", joinedUser);

        socket.join(joinedUser.roomId);
        io.to(joinedUser.roomId).emit("userJoined", `${joinedUser.name} has joined!`);
    });

    socket.on('message', (data: string) =>{
        console.log(data);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(PORT, () =>{
    console.log(`[Server] listening on ${PORT}`);
});