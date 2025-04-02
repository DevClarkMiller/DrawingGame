
// Types
import { Game } from "@src/def";
import  { Server, DefaultEventsMap } from 'socket.io';

export default abstract class Gamemode{
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
        this.io.to(this.roomId).emit('gameStarted', this.game);
        await this.gameLoop();
        this.io.to(this.roomId).emit("gameEnded", "Game is over"); // Placeholder until I determine what data needs to be sent over
        this.end();
    }

    protected abstract end(): void;
}