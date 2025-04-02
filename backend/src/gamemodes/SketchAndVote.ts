
// Types
import { Game } from "@src/def";
import Gamemode from "./GameMode";
import  { Server, DefaultEventsMap } from 'socket.io';

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
                    this.io.to(this.roomId).emit('timeDecrease', this.game.timeLeft); // Let the player know the current time left
                }
            }, 1000); // Execute every 1000 ms
        });
    }

    protected end(): void{
        console.log("SKETCH AND VOTE OVER!");
    }
}