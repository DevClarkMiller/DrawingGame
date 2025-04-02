
// Types
import { Game, Player, GamingPlayer, GameSession } from "@src/def";
import  { Server, DefaultEventsMap } from 'socket.io';

export default abstract class Gamemode{
    protected gameSession: GameSession;
    protected games: Map<string, GameSession>
    private roomId: string;
    private io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
    private eventStartName: string = "gameStarted";
    private eventEndName: string = "gameEnded";

    public constructor(
        gameSession: GameSession,
        games: Map<string, GameSession>, 
        roomId: string, 
        io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    ){
        this.gameSession = gameSession;
        this.games = games;
        this.roomId = roomId;
        this.io = io;
    }

    protected event(name: string, data: any){
        this.io.to(this.roomId).emit(name, data);
    }

    protected abstract gameLoop(): Promise<void>;

    public setup(): void{

    }
    
    async start(): Promise<void>{
        this.games.set(this.roomId, this.gameSession);

        // Start game loop, once the time runs out the game is over

        this.gameSession.game.running = true;
        console.log(this.games.get(this.roomId));

        // Emit that the game has started
        this.event(this.eventStartName, this.gameSession.game)
        await this.gameLoop();
    }

    protected end(): void{
        this.event(this.eventEndName, "Game is over"); // Placeholder until I determine what data needs to be sent over
        this.gameSession.game.running = false;
    };
}