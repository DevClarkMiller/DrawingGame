import express, { Request, Response, Application } from 'express';
import http from 'http';
import { Server, Socket, DefaultEventsMap } from 'socket.io';
import { randomUUID } from 'crypto';

// Lib imports
import loadEnv from '@lib/loadEnv';
import randomName from '@lib/randomName';
import SentenceParser from '@lib/sentenceParser';

// Types
import { Player, Room, RoomDetails, Message, Game } from '@def';

loadEnv(); // Must call this before any env variables can be accessed


/*!Environmental variables */
const PORT: number = parseInt(process.env.PORT as string) || 5170;
const CLIENT_URL: string = process.env.CLIENT_URL as string || "http://localhost:3000";
const ROOM_ID_LEN: number = parseInt(process.env.ROOM_ID_LEN as string) || 12;

const sentenceParser: SentenceParser = new SentenceParser();
const app: Application = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

// Change to use redis in production
let rooms: Map<string, RoomDetails> = new Map<string, RoomDetails>();
let players: Map<string, Player> = new Map<string, Player>(); // Socket ids mapped to their players
let games: Map<string, Game> = new Map<string, Game>(); // Key is the roomId of the game

function endRoom(player: Player, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>){
    console.log(`Ending room: ${player.roomId}`);
    // Check if room exists
    const roomDetails: RoomDetails | undefined = rooms.get(player.roomId);        
    if (!roomDetails){
        socket.emit("roomNotFound", `${player.roomId} was not found`);
        return;
    }

    const hostName: string = String(roomDetails.host.name);

    // Only the host can end the game
    if (hostName != player.name){
        socket.emit("cantEndRoom", `Can't end room [${player.roomId}], you're not the host`);
    }

    io.to(player.roomId).emit('exitRoom', "Please exit the room now");
    rooms.delete(player.roomId);
    socket.emit('endedRoom', `${player.roomId} has been ended`);
}

function endGame(roomId: string){
    const game: Game | undefined = games.get(roomId);

    if (!game) return; // Means no game is found
    game.running = false; // Stop the game from running
    io.to(roomId).emit("gameEnded", "Game is over"); // Placeholder until I determine what data needs to be sent over
}

// Creates all the callbacks related to managing a room
function manageRoom(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>){
    socket.on('createRoom', (hostName: string) =>{
        const roomId = randomUUID().substring(0, ROOM_ID_LEN);
        const newRoom: Room = {id: roomId, url: `${CLIENT_URL}/joinRoom?roomId=${roomId}`};

        const host: Player = {roomId, name: hostName, isHost: true};

        console.log(`CREATING ROOM ${roomId}`);
        rooms.set(roomId, {host, room: newRoom, players: [host], messages: []}); // Init with an array containing only the host

        socket.join(roomId);

        players.set(socket.id, host);

        io.to(roomId).emit("playerJoined", host);
        socket.emit("createdRoom", newRoom);
    });

    socket.on('endRoom', (player: Player) =>{ endRoom(player, socket); });

    socket.on('message', ({msg, player}: {msg: Message, player: Player}) =>{
        console.log(msg);
        const roomDetails: RoomDetails | undefined = rooms.get(player.roomId);
        
        if (roomDetails){
            roomDetails.messages.push(msg);
            io.to(player.roomId).emit('newMessage', msg);
        }
    });

    socket.on('joinRoom', (player: Player) =>{
        const roomDetails: RoomDetails | undefined = rooms.get(player.roomId);
        if (!roomDetails){
            socket.emit("roomNotFound", `${player.roomId} was not found`);
            return;
        }

        // Give the player a random name if they somehow don't have one
        if (!player.name) player.name = randomName();

        // Check if player already in room
        const playerInRoom = roomDetails.players.some(pl => pl.name === player.name);
        if (playerInRoom){
            socket.emit('nameTaken', `${player.name} already in room`);
            return;
        }

        roomDetails.players.push(player);

        players.set(socket.id, player);

        // When a player joins, they should also recieve a list of all the other players
        socket.emit("playerList", roomDetails.players);
        socket.emit("joinedRoom", roomDetails.room);
        io.to(player.roomId).emit("playerJoined", player);

        // Only set the player to be in the room after, so that they don't recieve the new player joining after they recieve the player list
        socket.join(player.roomId);
        player.isHost = false;
    });

    socket.on('disconnect', () => {
        const player: Player | undefined = players.get(socket.id);
        if (player){
            players.delete(socket.id);
            console.log(`Player ${player.name} disconnected`);

            const roomDetails: RoomDetails | undefined = rooms.get(player.roomId);
            if (roomDetails){
                // Remove player from the list
                roomDetails.players = roomDetails.players.filter(pl => pl.name !== player.name);
            }

            // Delete the room when the host disconnects POTENTIALLY REMAP THE HOST INSTEAD TO A DIFFERENT PLAYER
            if (player.isHost) {
                endRoom(player, socket);
                endGame(player.roomId); // Here any game will be ended too
            }
            io.to(player.roomId).emit('playerLeft', player);
        }
    });
}

function manageGame(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>){
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
        // Return the top 6 if there are over 6
        // if (sentences.length > 6){
        //     sentences = sentences.slice(0, 6);
        // }

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

io.on('connection', (socket) =>{
    manageRoom(socket);
    manageGame(socket);
});

server.listen(PORT, () =>{
    console.log(`[Server] listening on ${PORT}`);
});