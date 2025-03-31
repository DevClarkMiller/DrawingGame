import { Socket, DefaultEventsMap } from 'socket.io';
import { Game } from "@def";
import { io, games, sentenceParser } from '@src/index';

export function endGame(roomId: string){
    const game: Game | undefined = games.get(roomId);

    if (!game) return; // Means no game is found
    game.running = false; // Stop the game from running
    io.to(roomId).emit("gameEnded", "Game is over"); // Placeholder until I determine what data needs to be sent over
}

export function manageGame(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>){
    async function startGame(currentGame: Game, roomID: string): Promise<void>{ // Create a promise which resolves once the interval is complete
        return new Promise<void>((resolve) =>{
            const interval = setInterval(() => {
                if (currentGame.timeLeft <= 0 || !currentGame.running){ // If time runs out or game is stopped, quit interval
                    clearInterval(interval);
                    resolve();   
                }
                else{
                    currentGame.timeLeft -= 1; // Subtract one second from the game
                    io.to(roomID).emit('timeDecrease', currentGame.timeLeft); // Let the player know the current time left
                }
            }, 1000); // Execute every 1000 ms
        });
    }

    socket.on('parseSentence', async (sentence: string) =>{
        let sentences: string[] = await sentenceParser.parse(sentence);
        // Return the top 10 if there are over 10
        if (sentences.length > 10){
            sentences = sentences.slice(0, 10);
        }

        socket.emit('sentenceParsed', sentences);
    });

    socket.on('endGame', (roomId: string) =>{ endGame(roomId); });

    // Starts a specific game depending on the one provided
    socket.on('startGame', async ({game, roomId}: {game: Game, roomId: string}) =>{
        games.set(roomId, game);
        console.log(games.get(roomId));

        // Start game loop, once the time runs out the game is over
        const currentGame: Game | undefined = games.get(roomId);
        if (!currentGame) return;

        currentGame.running = true;

        // First emit that the game has started
        io.to(roomId).emit('gameStarted', game);
        await startGame(currentGame, roomId);
        io.to(roomId).emit("gameEnded", "Game is over"); // Placeholder until I determine what data needs to be sent over
        console.log("GAME OVER!!");
    });
}