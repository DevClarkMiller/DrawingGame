
// Types
import { Game, Player, GamingPlayer, GameSession } from "@src/def";
import Gamemode from "./GameMode";
import  { Server, DefaultEventsMap } from 'socket.io';
import { countdown } from "@src/roomEvents";

export class SketchAndVote extends Gamemode{
    private numRounds: number = 0;
    private playerImages: Map<string, string[]> = new Map<string, string[]>(); // Maps a players name to a stack of images that they will be able to draw

    public constructor(
        gameSession: GameSession,
        roomId: string, 
        io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    ){
        super(gameSession, roomId, io);
    }

    public override async init(): Promise<void>{
        // Start a 60 second timer, once it executes the start function is called
        this.event('nav', 'sketchAndVote');

        await countdown(
            () => true, // Always return true for now 
            45, // Players only get 45 seconds to pick their image
            (duration: number) => {
                this.event('imagePickTimeDecrease', duration); // Let the player know the current time left
            } 
        );

        this.start();
    }

    public setNumRounds(numRounds: number): void{
        this.numRounds = numRounds;
    }

    /**
     * Brief: Sets up the round, matching players to an image they haven't seen yet
    */
    private initRound(): void{
        this.event("newRound", this.numRounds);

        // Emit to each player their next image
        const gamingPlayers: Map<string, GamingPlayer> = this.gameSession.players;

        // Pop an image off each players image list
        gamingPlayers.forEach(gamingPlayer =>{
            let images: string[] = this.playerImages.get(gamingPlayer.player.name as string) as string[];
            
            const image: string | undefined= images.pop();

            if (image){
                this.eventTo(gamingPlayer.player.socketId, "nextImage", image); // Broadcast to the specific player
            }
        });
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

        // Set num rounds equal to n(players) - 1
        this.numRounds = players.size - 1;
        console.log(`NUM ROUNDS: ${this.numRounds}`);
        super.start();
    }

    public async gameLoop(): Promise<void>{
        this.initRound();
        await countdown(
            () => this.gameSession.game.running, 
            this.gameSession.game.maxTime,
            (duration: number) => {
                this.gameSession.game.timeLeft = duration;
                this.event('timeDecrease', this.gameSession.game.timeLeft); // Let the player know the current time left
            } 
        );

        this.end();
    }

    protected override end(): void{
        this.numRounds -= 1;

        if (this.numRounds > 0){ // Keeps calling gameLoop until the number of rounds is equal to 0
            console.log("SKETCH AND VOTE NEW ROUND");
            this.gameLoop();
        }else{ // All rounds have concluded
            super.end();
            // console.log("SKETCH AND VOTE OVER!");
        }
    }
}