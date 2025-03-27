import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import loadEnv from '../lib/loadEnv';
import http from 'http';
import { Server, Socket, DefaultEventsMap } from 'socket.io';
import { randomUUID } from 'crypto';
import randomName from '../lib/randomName';

// Types
import { Player, Room } from './def';

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

type RoomDetails = {
    room: Room;
    host: Player;
    players: Player[]; // All the players in the room
}

// Change to use redis in production
// The value is the hosts name
let rooms: Map<string, RoomDetails> = new Map<string, RoomDetails>();
let players: Map<string, Player> = new Map<string, Player>(); // Socket ids mapped to their players

function endRoom(player: Player, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>){
    console.log(`Ending room: ${player.roomId}`);
    // Check if room exists
    const roomDetails: RoomDetails | undefined = rooms.get(player.roomId);        
    if (!roomDetails){
        socket.emit("roomNotFound", `${player.roomId} was not found`);
        return;
    }

    const hostName: string = String(roomDetails.host.name);

    // Only the host can end the game
    if (hostName != player.name){
        socket.emit("cantEndRoom", `Can't end room [${player.roomId}], you're not the host`);
    }

    rooms.delete(player.roomId);
    socket.emit('endedRoom', `${player.roomId} has been ended`);
}

io.on('connection', (socket) =>{
    socket.on('createRoom', (hostName: string) =>{
        const roomId = randomUUID().substring(0, ROOM_ID_LEN);
        const newRoom: Room = {id: roomId, url: `${CLIENT_URL}/joinRoom?roomId=${roomId}`};

        const host: Player = {roomId, name: hostName, isHost: true};

        console.log(`CREATING ROOM ${roomId}`);
        rooms.set(roomId, {host, room: newRoom, players: [host]}); // Init with an array containing only the host

        socket.join(roomId);

        players.set(socket.id, host);

        io.to(roomId).emit("playerJoined", host);
        socket.emit("createdRoom", newRoom);
    });

    socket.on('joinRoom', (player: Player) =>{
        const roomDetails: RoomDetails | undefined = rooms.get(player.roomId);
        if (!roomDetails){
            socket.emit("roomNotFound", `${player.roomId} was not found`);
            return;
        }

        // Give the player a random name if they somehow don't have one
        if (!player.name) player.name = randomName();

        // Check if player already in room
        const playerInRoom = roomDetails.players.some(pl => pl.name === player.name);
        if (playerInRoom){
            socket.emit('nameTaken', `${player.name} already in room`);
            return;
        }

        roomDetails.players.push(player);

        players.set(socket.id, player);

        socket.join(player.roomId);
        player.isHost = false;

        // When a player joins, they should also recieve a list of all the other players
        socket.emit("playerList", roomDetails.players);
        socket.emit("joinedRoom", roomDetails.room);
        io.to(player.roomId).emit("playerJoined", player);
    });

    // Starts a specific game depending on the one provided
    socket.on('startGame', () =>{

    });

    socket.on('endRoom', (player: Player) =>{ endRoom(player, socket); });

    socket.on('message', (data: string) =>{
        console.log(data);
    });

    socket.on('disconnect', () => {
        const player: Player | undefined = players.get(socket.id);
        if (player){
            players.delete(socket.id);
            console.log(`Player ${player.name} disconnected`);

            const roomDetails: RoomDetails | undefined = rooms.get(player.roomId);
            if (roomDetails){
                // Remove player from the list
                roomDetails.players = roomDetails.players.filter(pl => pl.name !== player.name);
            }

            // Delete the room when the host disconnects POTENTIALLY REMAP THE HOST INSTEAD TO A DIFFERENT PLAYER
            if (player.isHost) endRoom(player, socket);
            io.to(player.roomId).emit('playerLeft', player);
        }
    });
});

server.listen(PORT, () =>{
    console.log(`[Server] listening on ${PORT}`);
});