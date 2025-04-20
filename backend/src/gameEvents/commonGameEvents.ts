import { Socket, DefaultEventsMap } from 'socket.io';
import { Game, GameSession, RoomDetails, GamingPlayer, Player } from "@def";
import Gamemode from '@src/gamemodes/GameMode';
import { gameFactory } from '@lib/gameFactory';
import { io, games, sentenceParser, rooms, players, activeGamemodes } from '@src/index';
import { SketchAndVote } from '@src/gamemodes/SketchAndVote';

export function endGame(roomId: string){
    const gameSession: GameSession | undefined = games.get(roomId);

    if (!gameSession) return; // Means no game is found
    gameSession.game.running = false; // Stop the game from running
    io.to(roomId).emit("gameEnded", "Game is over"); // Placeholder until I determine what data needs to be sent over
}

export function manageGame(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>){
    /*! SKETCH AND VOTE EVENTS */
    socket.on('parseSentence', async (sentence: string) =>{
        let sentences: string[] = await sentenceParser.parse(sentence);
        // Return the top 10 if there are over 10
        if (sentences.length > 10){
            sentences = sentences.slice(0, 10);
        }

        socket.emit('sentenceParsed', sentences);
    });

    socket.on('playerPickImage', async ({image, roomId}: {image: string, roomId: string}) =>{
        const player: Player | undefined = players.get(socket.id);
        if (!player) return;

        // For the game session, set the players image
        const gameSession: GameSession = games.get(roomId) as GameSession;

        const gamingPlayer: GamingPlayer = gameSession.players.get(player.name as string) as GamingPlayer;

        // Won't broadcast that the player is ready again if they just change the image
        if (gamingPlayer.data === null){
            io.to(roomId).emit("playerReady", player.name);
        }

        gamingPlayer.data = image;
    });

    socket.on('nextImage', (roomId: string) =>{
        let gamemode = activeGamemodes.get(roomId);
        if (!gamemode) return;
        (gamemode as SketchAndVote).nextImage();
    });

    /**
    * Brief: Adds the players sketch to their active SketchAndVote Gamemode
    */
    socket.on('playerSketchImage', async ({ogImg, newImgHist, roomId}: {ogImg: string, newImgHist: string[], roomId: string}) =>{
        let gamemode = activeGamemodes.get(roomId);
        if (!gamemode) return;
        const player: Player = players.get(socket.id) as Player;
        (gamemode as SketchAndVote).addSketch(player.name as string, ogImg, newImgHist);
    });

    socket.on('endGame', (roomId: string) =>{ endGame(roomId); });

    socket.on('initGame', ({game, roomId}: {game: Game, roomId: string}) =>{
        // Create a new game session
        let gameSession: GameSession = {game: game, players: new Map<string, GamingPlayer>};

        // Put all the players from the room into the game session
        const roomDetails: RoomDetails | undefined = rooms.get(roomId);
        if (!roomDetails) return;

        roomDetails.players.forEach(player =>{
            gameSession.players.set(player.name as string, {player: player, data: null});
        });

        const gamemode: Gamemode = gameFactory(gameSession, games, roomId, io);
        gamemode.init();
        activeGamemodes.set(roomId, gamemode);
    });


    socket.on('startGame', async ({roomId}: {game: Game, roomId: string}) =>{
        const gamemode: Gamemode = activeGamemodes.get(roomId) as Gamemode;
        gamemode.start();
    });
}