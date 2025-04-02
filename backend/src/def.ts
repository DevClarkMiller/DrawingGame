import { DefaultEventsMap, Server } from "socket.io";
import { io } from ".";

export type Room = {
    id: string;
    url: string;
}

export type Game = {
    name: "SketchAndVote"; // Acts like a string enum, more values will be added as more minigames are added
    timeLeft: number;
    maxTime: number;
    running: boolean;
}

export type Player = {
    name?: string; // If not provided, a random one will be generated
    isHost: boolean;
    roomId: string;
}

export type GamingPlayer = {
    player: Player;
    data: unknown;
}

export type GameSession = {
    game: Game;
    players: Map<string, GamingPlayer>;
}

export type Message = {
    author: string;
    text: string;
}

export type RoomDetails = {
    room: Room;
    host: Player;
    players: Player[]; // All the players in the room
    messages: Message[];
}

export class RequestError extends Error{
    public status: number

    constructor(status: number, msg: string){
        super("Error: " + msg);
        this.status = status;
    }
}