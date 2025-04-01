import { DefaultEventsMap, Server } from "socket.io";
import { io } from ".";

export type Room = {
    id: string;
    url: string;
}

export type Player = {
    name?: string; // If not provided, a random one will be generated
    isHost: boolean;
    roomId: string;
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

export abstract class Gamemode{
    protected game: Game; 
    protected games: Map<string, Game>
    protected roomId: string;
    protected io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

    public constructor(game: Game, games: Map<string, Game>, roomId: string, io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>){
        this.game = game;
        this.games = games;
        this.roomId = roomId;
        this.io = io;
    }

    protected abstract gameLoop(): Promise<void>;
    
    async start(): Promise<void>{
        this.games.set(this.roomId, this.game);
        console.log(this.games.get(this.roomId));

        // Start game loop, once the time runs out the game is over
        const currentGame: Game | undefined = this.games.get(this.roomId);
        if (!currentGame) return;

        currentGame.running = true;

        // First emit that the game has started
        io.to(this.roomId).emit('gameStarted', this.game);
        await this.gameLoop();
        io.to(this.roomId).emit("gameEnded", "Game is over"); // Placeholder until I determine what data needs to be sent over
    }
}

export class SketchAndVote extends Gamemode{
    async gameLoop(): Promise<void>{
        return new Promise<void>((resolve) =>{
            const interval = setInterval(() => {
                if (this.game.timeLeft <= 0 || !this.game.running){ // If time runs out or game is stopped, quit interval
                    clearInterval(interval);
                    resolve();   
                }
                else{
                    this.game.timeLeft -= 1; // Subtract one second from the game
                    io.to(this.roomId).emit('timeDecrease', this.game.timeLeft); // Let the player know the current time left
                }
            }, 1000); // Execute every 1000 ms
        });
    }

    async start(): Promise<void>  {
        await super.start();
        console.log("SKETCH AND VOTE OVER!");
    }
}

export type Game = {
    name: "SketchAndVote"; // Acts like a string enum, more values will be added as more minigames are added
    timeLeft: number;
    maxTime: number;
    running: boolean;
}

export class RequestError extends Error{
    public status: number

    constructor(status: number, msg: string){
        super("Error: " + msg);
        this.status = status;
    }
}