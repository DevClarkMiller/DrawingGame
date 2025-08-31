import { Socket, DefaultEventsMap } from 'socket.io';
import { Game, GameSession, RoomDetails, GamingPlayer, Player } from "@def";
import Gamemode from '@src/gamemodes/GameMode';
import { gameFactory } from '@lib/gameFactory';
import { SketchAndVote } from '@src/gamemodes/SketchAndVote';
import ServerContext, { SocketType } from '@src/ServerContext';
import SocketHandler from '@src/SocketHandler';

export function endGame(roomId: string){
    const ctx: ServerContext = ServerContext.Instance;

    const gameSession: GameSession | undefined = ctx.Games.get(roomId);

    if (!gameSession) return; // Means no game is found
    gameSession.game.running = false; // Stop the game from running
    ctx.Io.to(roomId).emit("gameEnded", "Game is over"); // Placeholder until I determine what data needs to be sent over
}

export class GameHandler extends SocketHandler{
    async OnParseSentence(sentence: string){
        let sentences: string[] = await this.ctx.SentenceParser.Parse(sentence);
        // Return the top 10 if there are over 10
        if (sentences.length > 10){
            sentences = sentences.slice(0, 10);
        }

        this.socket.emit('sentenceParsed', sentences);
    }

    async OnPlayerPickImage({image, roomId}: {image: string, roomId: string}){
        const player: Player | undefined = this.ctx.GetPlayer(this.socket.id);
        if (!player) return;

        // For the game session, set the players image
        const gameSession: GameSession = this.ctx.Games.get(roomId) as GameSession;

        const gamingPlayer: GamingPlayer = gameSession.players.get(player.name as string) as GamingPlayer;

        // Won't broadcast that the player is ready again if they just change the image
        if (gamingPlayer.data === null){
            this.ctx.Io.to(roomId).emit("playerReady", player.name);
        }

        gamingPlayer.data = image;  
    }

    OnNextImage(roomid: string){
        const gamemode: Gamemode = this.ctx.GetActiveGamemode(roomid);
        if (!gamemode) return;
        (gamemode as SketchAndVote).NextImage();
    }

    OnPlayerSketchImage({ogImg, newImgHist, roomId}: {ogImg: string, newImgHist: string[], roomId: string}){
        const gamemode: Gamemode = this.ctx.GetActiveGamemode(roomId);
        if (!gamemode) return;
        const player: Player = this.ctx.GetPlayer(this.socket.id) as Player;
        (gamemode as SketchAndVote).addSketch(player.name as string, ogImg, newImgHist);
    }

    OnPlayerVote({idx, image}: {idx: number, image: string}){
        const player: Player | undefined = this.ctx.GetPlayer(this.socket.id);
        if (!player) return;

        const gamemode: Gamemode = this.ctx.GetActiveGamemode(player.roomId);
        if (!gamemode) return;
        (gamemode as SketchAndVote).Vote(player, idx, image);
    }

    OnInitGame({game, roomId}: {game: Game, roomId: string}){
        // Create a new game session
        let gameSession: GameSession = {game: game, players: new Map<string, GamingPlayer>()};

        // Put all the players from the room into the game session
        const roomDetails: RoomDetails | undefined = this.ctx.GetRoom(roomId);
        if (!roomDetails) return;

        roomDetails.players.forEach(player =>{
            gameSession.players.set(player.name as string, {player: player, data: null});
        });

        const gamemode: Gamemode = gameFactory(gameSession, this.ctx.Games, roomId, this.ctx.Io);
        gamemode.Init();
        this.ctx.ActiveGamemodes.set(roomId, gamemode);
    }

    OnStartGame({roomId}: {game: Game, roomId: string}){
        const gamemode: Gamemode = this.ctx.GetActiveGamemode(roomId);
        gamemode.Start();
    }
}


export function manageGame(socket: SocketType){
    const hndl: GameHandler = new GameHandler(ServerContext.Instance, socket);
    /*! SKETCH AND VOTE EVENTS */
    socket.on('parseSentence', async (sentence: string) =>{ hndl.OnParseSentence(sentence) });
    socket.on('playerPickImage', async (data : {image: string, roomId: string}) => hndl.OnPlayerPickImage(data));
    socket.on('nextImage', (roomId: string) => hndl.OnNextImage(roomId));

    /**
    * Brief: Adds the players sketch to their active SketchAndVote Gamemode
    */
    socket.on('playerSketchImage', async (data: {ogImg: string, newImgHist: string[], roomId: string}) => await hndl.OnPlayerSketchImage(data));
    socket.on('playerVote', (data: {idx: number, image: string}) => hndl.OnPlayerVote(data));
    socket.on('endGame', (roomId: string) =>{ endGame(roomId); });
    socket.on('initGame', (data: {game: Game, roomId: string}) => hndl.OnInitGame(data) );

    socket.on('startGame', async (data: {game: Game, roomId: string}) => hndl.OnStartGame(data));
}