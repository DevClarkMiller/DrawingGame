import { Socket, DefaultEventsMap } from 'socket.io';
import { randomUUID } from 'crypto';

import randomName from '@lib/randomName';
import { Player, Room, RoomDetails, Message } from "@def";
import { io, rooms, players, ROOM_ID_LEN, CLIENT_URL } from '@src/index';
import { endGame } from './gameEvents/commonGameEvents';

/**
 * Brief: Each tick the callback is triggered with the time remaining
 * @param isRunning Checks if the countdown should still be running
 * @param duration The duration of the countdown
*/
export async function countdown(isRunning: () => boolean, duration: number, callback?: (duration: number) => void): Promise<any>{
    const loop = new Promise<void>((resolve) =>{
        const interval = setInterval(() => {
            if (duration <= 0 || !isRunning()){ // If time runs out or game is stopped, quit interval
                clearInterval(interval);
                resolve();   
            }
            else{
                duration -= 1; // Subtract one second from the game
                if (callback) callback(duration);
            }
        }, 1000); // Execute every second

    });

    await loop;
}

export function endRoom(player: Player, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>){
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

export function manageRoom(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>){
    socket.on('createRoom', (hostName: string) =>{
        const roomId = randomUUID().substring(0, ROOM_ID_LEN);
        const newRoom: Room = {id: roomId, url: `${CLIENT_URL}/joinRoom?roomId=${roomId}`};

        const host: Player = {roomId, name: hostName, isHost: true, socketId: socket.id};

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

        player.socketId = socket.id;

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
