
// Types
import { Game, Player, GamingPlayer, GameSession } from "@src/def";
import Gamemode from "./GameMode";
import  { Server, DefaultEventsMap } from 'socket.io';

export class SketchAndVote extends Gamemode{
    private numRounds: number = 5;
    private playerImages: Map<string, string[]> = new Map<string, string[]>(); // Maps a players name to a stack of images that they will be able to draw

    public constructor(
        gameSession: GameSession,
        roomId: string, 
        io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    ){
        super(gameSession, roomId, io);
    }

    public override init(): void{
        // Start a 60 second timer, once it executes the start function is called
        this.event('nav', 'sketchAndVote');
        setTimeout(() =>{
            this.start();
        }, 60000)
    }

    public setNumRounds(numRounds: number): void{
        this.numRounds = numRounds;
    }

    /**
     * Brief: Sets up the round, matching players to an image they haven't seen yet
     */
    private initRound(): void{
        this.event("newRound", this.numRounds);
    }

    public override async start(): Promise<void>{
        // Set all the player images
        const players: Map<string, GamingPlayer> = this.gameSession.players;

        // Get a list of all the images from each player
        let images: string[] = [];
        players.forEach(player => images.push(player.data as string));
        // Now for each player, set their possible images
        players.forEach(player =>{
            const possibleImages: string[] = images.filter(img => img != player.data as string);
            this.playerImages.set(player.player.name as string, possibleImages);
        });

        console.log(this.playerImages);

        super.start();
    }

    public async gameLoop(): Promise<void>{
        const loop = new Promise<void>((resolve) =>{
            // Setup for the new round here
            this.initRound();

            const interval = setInterval(() => {
                if (this.gameSession.game.timeLeft <= 0 || !this.gameSession.game.running){ // If time runs out or game is stopped, quit interval
                    clearInterval(interval);
                    resolve();   
                }
                else{
                    this.gameSession.game.timeLeft -= 1; // Subtract one second from the game
                    this.event('timeDecrease', this.gameSession.game.timeLeft); // Let the player know the current time left
                }
            }, 1000); // Execute every second
        });

        await loop;
        this.end();
    }

    protected override end(): void{
        if (this.numRounds > 0){ // Keeps calling gameLoop until the number of rounds is equal to 0
            console.log("SKETCH AND VOTE NEW ROUND");
            this.numRounds -= 1;
            this.gameLoop();
        }else{ // All rounds have concluded
            console.log("SKETCH AND VOTE OVER!");
        }
    }
}