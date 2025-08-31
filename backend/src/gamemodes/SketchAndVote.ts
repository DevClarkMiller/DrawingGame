// Types
import { Game, Player, GamingPlayer, GameSession } from "@src/def";
import Gamemode from "./GameMode";
import  { Server, DefaultEventsMap } from 'socket.io';
import { countdown } from "@src/roomEvents";
import randomItem from "@lib/randomItem";
import DEFAULT_IMAGES from "@lib/defaultImages";

export class SketchAndVote extends Gamemode{
    private _numRounds: number = 0;
    private _playerImages: Map<string, string[]> = new Map<string, string[]>(); // Maps a players name to a stack of images that they will be able to draw
    private _playerSketches: Map<string, Map<string, string[]>> = new Map<string, Map<string, string[]>>(); // The key is the url of the image, the value is each player and their submission
    private _imagesToDisplay: string[] = []; // Slowly pop off each image from here, whenever the host click the next image button
    private _playerVotes: Map<string, number[]> = new Map<string, number[]>(); // Key is the image, each index in the number array correlates to the index of the player sketch and how many votes they got
    private _playersWhoVoted: Map<string, number> = new Map<string, number>(); // This is reset each the host clicks "new image" or the timer runs out to vote

    public constructor(
        gameSession: GameSession,
        roomId: string, 
        io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
    ){
        super(gameSession, roomId, io);
    }

    public override async Init(): Promise<void>{
        // Start a 60 second timer, once it executes the start function is called
        this.Event('nav', 'sketchAndVote');

        await countdown(
            () => true, // Always return true for now 
            5, // Players only get 45 seconds to pick their image
            (duration: number) => {
                this.Event('imagePickTimeDecrease', duration); // Let the player know the current time left
            } 
        );

        this.Start();
    }

    public setNumRounds(numRounds: number): void{
        this._numRounds = numRounds;
    }

    /**
     * Brief: Sets up the round, matching players to an image they haven't seen yet
    */
    private InitRound(): void{
        this.Event("newRound", this._numRounds);

        // Emit to each player their next image
        const gamingPlayers: Map<string, GamingPlayer> = this.gameSession.players;

        // Pop an image off each players image list
        gamingPlayers.forEach(gamingPlayer =>{
            let images: string[] = this._playerImages.get(gamingPlayer.player.name as string) as string[];
            
            const image: string | undefined = images.pop();

            if (image){
                this.EventTo(gamingPlayer.player.socketId, "nextImage", image); // Broadcast to the specific player
            }
        });
    }

    public override async Start(): Promise<void>{
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
            this._playerImages.set(player.player.name as string, possibleImages);
        });

        // Set num rounds equal to n(players) - 1
        this._numRounds = players.size - 1;
        this.Event('numRounds', this._numRounds);
        super.Start();
    }

    public async GameLoop(): Promise<void>{
        this.InitRound();
        await countdown(
            () => this.gameSession.game.running, 
            this.gameSession.game.maxTime,
            (duration: number) => {
                this.gameSession.game.timeLeft = duration;
                this.Event('timeDecrease', this.gameSession.game.timeLeft); // Let the player know the current time left
            } 
        );

        this.End();
    }

    public addSketch(player: string, ogImg: string, newImgHist: string[]): void{
        if (!this._playerSketches.has(ogImg)){ // Initialize the value 
            this._playerSketches.set(ogImg, new Map<string, string[]>());
        }

        // Add the players image to this sketch map
        let sketches = this._playerSketches.get(ogImg) as Map<string, string[]>;
        sketches.set(player, newImgHist);

        // Send sketchOrder once all players have sent over their images
        if (this._playerSketches.size === this._playerImages.size && this._numRounds === 0){ // Only send out the sketch order at the very end
            this._imagesToDisplay = Array.from(this._playerSketches.keys());
            this.Event('sketchOrder', [...this._imagesToDisplay].reverse()); // Emit the sketch order to the players in a reversed order
        }
    }

    protected override End(): void{
        this._numRounds -= 1;

        if (this._numRounds > 0){ // Keeps calling gameLoop until the number of rounds is equal to 0
            this.GameLoop();
        }else{ // All rounds have concluded
            super.End();
        }
    }

    public Vote(player: Player, idx: number, image: string): void{
        const oldIdx: number | undefined = this._playersWhoVoted.get(player.name as string);
        if (oldIdx !== undefined){ // Will decrement their old vote
            (this._playerVotes.get(image) as number[])[oldIdx] -= 1; // Takes back the old vote
        }; 

        (this._playerVotes.get(image) as number[])[idx] += 1; // Gives a vote to the given index
        this._playersWhoVoted.set(player.name as string, idx);
    }

    public NextImage(): void{
        this._playersWhoVoted.clear(); 
        let img: string;
        if (this._imagesToDisplay.length > 0){
            img = this._imagesToDisplay.pop() as string;
            const cnt: number = (this._playerSketches.get(img) as Map<string, string[]>).size;
            const voteArray = new Array(cnt).fill(0);
            this._playerVotes.set(img, voteArray);
            // This is needed to serialize the map
            this.Event("nextFinalImage", {image: img, sketches: Array.from((this._playerSketches.get(img)?.entries() as any))});
        }else{
            console.log("OUT OF IMAGES");
        }
    }
}