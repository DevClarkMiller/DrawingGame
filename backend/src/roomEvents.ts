import { randomUUID } from 'crypto';

import randomName from '@lib/randomName';
import { Player, Room, RoomDetails, Message } from "@def";
import { ROOM_ID_LEN, CLIENT_URL } from '@src/index';
import { endGame } from './gameEvents/commonGameEvents';
import ServerContext, { SocketType } from './ServerContext';
import SocketHandler from './SocketHandler';

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

export class RoomHandler extends SocketHandler{
    public OnEndRoom(player: Player){
        console.log(`Ending room: ${player.roomId}`);
        // Check if room exists
        const roomDetails: RoomDetails | undefined = this.ctx.Rooms.get(player.roomId);        
        if (!roomDetails){
            this.socket.emit("roomNotFound", `${player.roomId} was not found`);
            return;
        }

        const hostName: string = String(roomDetails.host.name);

        // Only the host can end the game
        if (hostName != player.name){
            this.socket.emit("cantEndRoom", `Can't end room [${player.roomId}], you're not the host`);
        }

        this.ctx.Io.to(player.roomId).emit('exitRoom', "Please exit the room now");
        this.ctx.Rooms.delete(player.roomId);
        this.socket.emit('endedRoom', `${player.roomId} has been ended`);
    }

    public OnCreateRoom(hostName: string){
        const roomId = randomUUID().substring(0, ROOM_ID_LEN);
        const newRoom: Room = {id: roomId, url: `${CLIENT_URL}/joinRoom?roomId=${roomId}`};

        const host: Player = {roomId, name: hostName, isHost: true, socketId: this.socket.id};

        console.log(`CREATING ROOM ${roomId}`);
        this.ctx.Rooms.set(roomId, {host, room: newRoom, players: [host], messages: []}); // Init with an array containing only the host

        this.socket.join(roomId);

        this.ctx.Players.set(this.socket.id, host);

        this.ctx.Io.to(roomId).emit("playerJoined", host);
        this.socket.emit("createdRoom", newRoom);
    }

    public OnMessage({msg, player}: {msg: Message, player: Player}){
        console.log(msg);
        const roomDetails: RoomDetails | undefined = this.ctx.GetRoom(player.roomId);
        
        if (roomDetails){
            roomDetails.messages.push(msg);
            this.ctx.Io.to(player.roomId).emit('newMessage', msg);
        }
    }

    public OnJoinRoom(player: Player){
        const roomDetails: RoomDetails | undefined = this.ctx.GetRoom(player.roomId);
        if (!roomDetails){
            this.socket.emit("roomNotFound", `${player.roomId} was not found`);
            return;
        }

        player.socketId = this.socket.id;

        // Give the player a random name if they somehow don't have one
        if (!player.name) player.name = randomName();

        // Check if player already in room
        const playerInRoom = roomDetails.players.some(pl => pl.name === player.name);
        if (playerInRoom){
            this.socket.emit('nameTaken', `${player.name} already in room`);
            return;
        }

        roomDetails.players.push(player);

        this.ctx.Players.set(this.socket.id, player);

        // When a player joins, they should also recieve a list of all the other players
        this.socket.emit("playerList", roomDetails.players);
        this.socket.emit("joinedRoom", roomDetails.room);
        this.ctx.Io.to(player.roomId).emit("playerJoined", player);

        // Only set the player to be in the room after, so that they don't recieve the new player joining after they recieve the player list
        this.socket.join(player.roomId);
        player.isHost = false;
    }

    public OnDisconnect(){
        const player: Player | undefined = this.ctx.GetPlayer(this.socket.id);
        if (player){
            this.ctx.Players.delete(this.socket.id);
            console.log(`Player ${player.name} disconnected`);

            const roomDetails: RoomDetails | undefined = this.ctx.GetRoom(player.roomId);
            if (roomDetails){
                // Remove player from the list
                roomDetails.players = roomDetails.players.filter(pl => pl.name !== player.name);
            }

            // Delete the room when the host disconnects POTENTIALLY REMAP THE HOST INSTEAD TO A DIFFERENT PLAYER
            if (player.isHost) {
                this.OnEndRoom(player);
                endGame(player.roomId); // Here any game will be ended too
            }
            this.ctx.Io.to(player.roomId).emit('playerLeft', player);
        }
    }
}

export function manageRoom(socket: SocketType){
    const hndl: RoomHandler = new RoomHandler(ServerContext.Instance, socket);

    socket.on('joinRoom', (player: Player) =>{ hndl.OnJoinRoom(player); });

    socket.on('createRoom', (hostName: string) =>{ hndl.OnCreateRoom(hostName) });
    socket.on('endRoom', (player: Player) =>{ hndl.OnEndRoom(player)});
    socket.on('message', (msgData: {msg: Message, player: Player}) =>{ hndl.OnMessage(msgData); });

    socket.on('disconnect', () => { hndl.OnDisconnect(); });
}
