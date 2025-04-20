// Types
import { Game, Player, GamingPlayer, GameSession } from "@src/def";
import Gamemode from "./GameMode";
import  { Server, DefaultEventsMap } from 'socket.io';
import { countdown } from "@src/roomEvents";
import randomItem from "@lib/randomItem";
import DEFAULT_IMAGES from "@lib/defaultImages";

export class SketchAndVote extends Gamemode{
    private numRounds: number = 0;
    private playerImages: Map<string, string[]> = new Map<string, string[]>(); // Maps a players name to a stack of images that they will be able to draw
    private playerSketches: Map<string, Map<string, string[]>> = new Map<string, Map<string, string[]>>(); // The key is the url of the image, the value is each player and their submission
    private imagesToDisplay: string[] = []; // Slowly pop off each image from here, whenever the host click the next image button

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
            15, // Players only get 30 seconds to pick their image
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
            
            const image: string | undefined = images.pop();

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
        players.forEach(player => {
            player.data = player.data ?? randomItem(DEFAULT_IMAGES);
            images.push(player.data as string); // Uses a default image if the player didn't make a selection in time
        });

        // Now for each player, set their possible images
        players.forEach(player =>{
            const possibleImages: string[] = images.filter(img => img != player.data as string);
            this.playerImages.set(player.player.name as string, possibleImages);
        });

        // Set num rounds equal to n(players) - 1
        this.numRounds = players.size - 1;
        console.log(`NUM ROUNDS: ${this.numRounds}`);
        this.event('numRounds', this.numRounds);
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

    public addSketch(player: string, ogImg: string, newImgHist: string[]): void{
        if (!this.playerSketches.has(ogImg)){ // Initialize the value 
            this.playerSketches.set(ogImg, new Map<string, string[]>());
            return;
        }

        // Add the players image to this sketch map
        let sketches = this.playerSketches.get(ogImg) as Map<string, string[]>;
        sketches.set(player, newImgHist);
    }

    protected override end(): void{
        this.numRounds -= 1;

        if (this.numRounds > 0){ // Keeps calling gameLoop until the number of rounds is equal to 0
            console.log("SKETCH AND VOTE NEW ROUND");
            this.gameLoop();
        }else{ // All rounds have concluded
            super.end();
            this.imagesToDisplay = Array.from(this.playerImages.keys());
        }
    }

    public nextImage(): void{
        let img: string;
        if (this.imagesToDisplay.length > 0){
            img = this.imagesToDisplay.pop() as string;
            this.event("nextFinalImage", {image: img, sketches: this.playerImages.get(img)});
        }else{
            console.log("OUT OF IMAGES");
        }
    }
}