import express, { Application } from 'express';
import http from 'http';
import { Server } from 'socket.io';

// Lib imports
import loadEnv from '@lib/loadEnv';
import SentenceParser from '@lib/sentenceParser';

// Types
import { Player,  RoomDetails,  Game } from '@def';

loadEnv(); // Must call this before any env variables can be accessed

/*!Environmental variables */
const PORT: number = parseInt(process.env.PORT as string) || 5170;
export const CLIENT_URL: string = process.env.CLIENT_URL as string || "http://localhost:3000";
export const ROOM_ID_LEN: number = parseInt(process.env.ROOM_ID_LEN as string) || 12;

export const sentenceParser: SentenceParser = new SentenceParser();
const app: Application = express();
const server = http.createServer(app);
export const io = new Server(server, {cors: { origin: "*" }});

// Change to use redis in production
export let rooms: Map<string, RoomDetails> = new Map<string, RoomDetails>();
export let players: Map<string, Player> = new Map<string, Player>(); // Socket ids mapped to their players
export let games: Map<string, Game> = new Map<string, Game>(); // Key is the roomId of the game

// Import events
import { manageRoom } from '@src/roomEvents';
import { manageGame } from '@src/gameEvents/commonGameEvents';

io.on('connection', (socket) =>{
    manageRoom(socket);
    manageGame(socket);
});

server.listen(PORT, () =>{
    console.log(`[Server] listening on ${PORT}`);
});