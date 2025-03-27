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
}    
);

type NewRoom = {
    id: string;
    url: string;
}

type JoinedUser = {
    name?: string; // If not provided, a random one will be generated
    roomId: string;
}

io.on('connection', (socket) =>{
    console.log("A user connected");

    socket.on('createRoom', (data: any) =>{
        const roomId = randomUUID().substring(0, ROOM_ID_LEN);
        const newRoom: NewRoom = {id: roomId, url: `${CLIENT_URL}/room/${roomId}`};
        console.log(`CREATING ROOM ${roomId}`);
        socket.join(roomId);
        io.to(roomId).emit("userJoined", `${randomName()} has joined!`);
        socket.emit("createdRoom", newRoom);
    });

    socket.on('joinRoom', (joinedUser: JoinedUser) =>{
        console.log("A user is joining!", joinedUser);
        socket.join(joinedUser.roomId);
        socket.to(joinedUser.roomId).emit("userJoined", `${joinedUser.name} has joined!`);
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