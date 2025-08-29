import { Socket, DefaultEventsMap } from 'socket.io';
import { Game, GameSession, RoomDetails, GamingPlayer, Player } from "@def";
import Gamemode from '@src/gamemodes/GameMode';
import { gameFactory } from '@lib/gameFactory';
import { SketchAndVote } from '@src/gamemodes/SketchAndVote';
import ServerContext, { SocketType } from '@src/ServerContext';

export function endGame(roomId: string){
    const ctx: ServerContext = ServerContext.Instance;

    const gameSession: GameSession | undefined = ctx.Games.get(roomId);

    if (!gameSession) return; // Means no game is found
    gameSession.game.running = false; // Stop the game from running
    ctx.Io.to(roomId).emit("gameEnded", "Game is over"); // Placeholder until I determine what data needs to be sent over
}

export function manageGame(socket: SocketType){
    const ctx: ServerContext = ServerContext.Instance;
    /*! SKETCH AND VOTE EVENTS */
    socket.on('parseSentence', async (sentence: string) =>{
        let sentences: string[] = await ctx.SentenceParser.parse(sentence);
        // Return the top 10 if there are over 10
        if (sentences.length > 10){
            sentences = sentences.slice(0, 10);
        }

        socket.emit('sentenceParsed', sentences);
    });

    socket.on('playerPickImage', async ({image, roomId}: {image: string, roomId: string}) =>{
        const player: Player | undefined = ctx.GetPlayer(socket.id);
        if (!player) return;

        // For the game session, set the players image
        const gameSession: GameSession = ctx.Games.get(roomId) as GameSession;

        const gamingPlayer: GamingPlayer = gameSession.players.get(player.name as string) as GamingPlayer;

        // Won't broadcast that the player is ready again if they just change the image
        if (gamingPlayer.data === null){
            ctx.Io.to(roomId).emit("playerReady", player.name);
        }

        gamingPlayer.data = image;
    });

    socket.on('nextImage', (roomId: string) =>{
        const gamemode: Gamemode = ctx.GetActiveGamemode(roomId);
        if (!gamemode) return;
        (gamemode as SketchAndVote).nextImage();
    });

    /**
    * Brief: Adds the players sketch to their active SketchAndVote Gamemode
    */
    socket.on('playerSketchImage', async ({ogImg, newImgHist, roomId}: {ogImg: string, newImgHist: string[], roomId: string}) =>{
        const gamemode: Gamemode = ctx.GetActiveGamemode(roomId);
        if (!gamemode) return;
        const player: Player = ctx.GetPlayer(socket.id) as Player;
        (gamemode as SketchAndVote).addSketch(player.name as string, ogImg, newImgHist);
    });

    socket.on('playerVote', ({idx, image}: {idx: number, image: string}) =>{
        const player: Player | undefined = ctx.GetPlayer(socket.id);
        if (!player) return;

        const gamemode: Gamemode = ctx.GetActiveGamemode(player.roomId);
        if (!gamemode) return;
        (gamemode as SketchAndVote).vote(player, idx, image);
    });

    socket.on('endGame', (roomId: string) =>{ endGame(roomId); });

    socket.on('initGame', ({game, roomId}: {game: Game, roomId: string}) =>{
        // Create a new game session
        let gameSession: GameSession = {game: game, players: new Map<string, GamingPlayer>()};

        // Put all the players from the room into the game session
        const roomDetails: RoomDetails | undefined = ctx.GetRoom(roomId);
        if (!roomDetails) return;

        roomDetails.players.forEach(player =>{
            gameSession.players.set(player.name as string, {player: player, data: null});
        });

        const gamemode: Gamemode = gameFactory(gameSession, ctx.Games, roomId, ctx.Io);
        gamemode.init();
        ctx.ActiveGamemodes.set(roomId, gamemode);
    });


    socket.on('startGame', async ({roomId}: {game: Game, roomId: string}) =>{
        const gamemode: Gamemode = ctx.GetActiveGamemode(roomId);
        gamemode.start();
    });
}