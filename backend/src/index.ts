import express, { Request, Response, Application } from 'express';
import loadEnv from '../lib/loadEnv';
import http from 'http';
import { Server } from 'socket.io';
import { randomUUID } from 'crypto';

loadEnv();
const PORT: number = parseInt(process.env.PORT as string) || 5170;

const app: Application = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) =>{
    console.log("A user connected");

    socket.on('createRoom', (roomId: string) =>{
        console.log(`CREATING ROOM ${randomUUID()}`);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(PORT, () =>{
    console.log(`[Server] listening on ${PORT}`);
});