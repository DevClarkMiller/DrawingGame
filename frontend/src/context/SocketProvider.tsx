import React, { Dispatch, SetStateAction, createContext, useEffect, useState } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';

// Types
import { Room, Player, Message } from '../def';

// Custom hooks
import { useSocket } from '../hooks/useSocket';

export type SocketContextType = {
    // State
    isConnected: boolean;
    events: any[];
    currentRoom: Room | undefined;
    loading: boolean;
    players: Player[];

    // State setters
    setIsConnected: Dispatch<SetStateAction<boolean>>;
    setEvents: Dispatch<SetStateAction<any[]>>;
    setCurrentRoom: Dispatch<SetStateAction<Room | undefined>>;
    setLoading: Dispatch<SetStateAction<boolean>>;
    setPlayers: Dispatch<SetStateAction<Player[]>>;

    // Functions
    joinRoom: (name: string, roomId: string) => void;
    createRoom: (hostName: string) => void;
    leaveRoom: () => void;
}

export const SocketContext = createContext<SocketContextType>({
    players: [],
    loading: true,
    currentRoom: undefined,
    isConnected: false,
    events: [],
    joinRoom: () => {},
    createRoom: () => {},
    leaveRoom: () => {},
    setIsConnected: () => {}, 
    setEvents: () => {},
    setCurrentRoom: () => {},
    setLoading: () => {},
    setPlayers: () => {}
});
function SocketProvider({children}: {children: React.ReactNode}) {
    const navigate: NavigateFunction = useNavigate();

    const socket: Socket = useSocket(process.env.SERVER_URL as string || "http://localhost:5170");
    const [isConnected, setIsConnected] = useState<boolean>(socket?.connected);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentRoom, setCurrentRoom] = useState<Room | undefined>(undefined);
    const [currentPlayer, setCurrentPlayer] = useState<Player | undefined>();
    const [events, setEvents] = useState<any[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    
    function joinRoom(name: string, roomId: string){
        setLoading(true);
        if (!isConnected) socket?.connect();
        const player: Player = {name, roomId, isHost: false};
        setCurrentPlayer(player);
        socket.emit("joinRoom", player);
    }

    function createRoom(hostName: string){
        setCurrentPlayer({name: hostName, roomId: "", isHost: true});
        setLoading(true);
        socket.emit("createRoom", hostName);
    }

    function leaveRoom(){
        setLoading(true);
        setCurrentPlayer(undefined);
        socket.disconnect();
        socket.connect(); // Reconnect
    }

    useEffect(() =>{
        function onConnect(){
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        function createdRoom(room: Room){
            if (currentPlayer) // Player will be given a name and has the isHost boolean set before this is called
                setCurrentPlayer({...currentPlayer, roomId: room.id}); // Set the roomId on current player
            setCurrentRoom(room);
            setLoading(false);
            navigate('/manageRoom');
            console.log(room);
        }

        function onJoinedRoom(room: Room){
            setLoading(false);
            setCurrentRoom(room);
            navigate('/viewRoom');
        }

        function onPlayerJoined(player: Player){         
            if (player.name != currentPlayer?.name)   
                setPlayers(prevPlayers =>  [...prevPlayers as Player[], player]); 
        }

        function roomNotFound(msg: string){
            setCurrentPlayer(undefined);
            alert(msg);
        }

        function playerLeft(player: Player){
            setPlayers(prevPlayers => prevPlayers.filter(pl => pl.name != player.name));
        }

        // Is called when the player joins, gives them a list of everyone in the room
        function onPlayerList(playerList: Player[]){
            console.log();
            setPlayers(playerList);
        }

        function onNameTaken(msg: string){
            setLoading(false);
            alert(msg);
        }

        function onExitRoom(msg: string){
            if (currentPlayer)
                navigate(currentPlayer.isHost ? "/" : "/joinRoom");
            else
                navigate('/');
        }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('playerJoined', onPlayerJoined);
        socket.on('createdRoom', createdRoom);
        socket.on('roomNotFound', roomNotFound);
        socket.on('playerLeft', playerLeft);
        socket.on('playerList', onPlayerList);
        socket.on('joinedRoom', onJoinedRoom);
        socket.on('nameTaken', onNameTaken);
        socket.on('exitRoom', onExitRoom);

        return () =>{
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('playerJoined', onPlayerJoined);
            socket.off('createdRoom', createdRoom);
            socket.off('roomNotFound', roomNotFound);
            socket.off('playerLeft', playerLeft);
            socket.off('playerList', onPlayerList);
            socket.off('joinedRoom', onJoinedRoom);
            socket.off('nameTaken', onNameTaken);
            socket.off('exitRoom', onExitRoom);
        }
    }, []);

    return (
        <SocketContext.Provider value={{
            loading, setLoading,
            players, setPlayers,
            events, setEvents, 
            isConnected, setIsConnected, 
            joinRoom, createRoom, leaveRoom,
            currentRoom, setCurrentRoom
        }}>
            {children}
        </SocketContext.Provider>
    );
}

export default SocketProvider;