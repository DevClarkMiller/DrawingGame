import { Socket, DefaultEventsMap } from 'socket.io';
import { Game, Gamemode } from "@def";
import { gameFactory } from '@lib/gameFactory';
import { io, games, sentenceParser } from '@src/index';

export function endGame(roomId: string){
    const game: Game | undefined = games.get(roomId);

    if (!game) return; // Means no game is found
    game.running = false; // Stop the game from running
    io.to(roomId).emit("gameEnded", "Game is over"); // Placeholder until I determine what data needs to be sent over
}

export function manageGame(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>){
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
        const gamemode = gameFactory(game, games, roomId, io);
        gamemode.start();
    });
}