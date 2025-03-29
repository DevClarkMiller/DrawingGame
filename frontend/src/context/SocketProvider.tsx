import React, { Dispatch, SetStateAction, createContext, useEffect, useState, useReducer } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';

// Types
import { Room, Player, Message, Game } from '@def';

// Reducers
import { INITIAL_GAME, gameReducer, GameActionKind, GameAction } from '@reducers/gameReducer';

// Custom hooks
import { useSocket } from '@hooks/useSocket';

export type SocketContextType = {
    // State
    isConnected: boolean;
    events: any[];
    currentRoom: Room | undefined;
    currentGame: Game | undefined;
    loading: boolean;
    players: Player[];

    // State setters
    setIsConnected: Dispatch<SetStateAction<boolean>>;
    setEvents: Dispatch<SetStateAction<any[]>>;
    setCurrentRoom: Dispatch<SetStateAction<Room | undefined>>;
    dispatchGame: React.ActionDispatch<[action: GameAction]>;
    setLoading: Dispatch<SetStateAction<boolean>>;
    setPlayers: Dispatch<SetStateAction<Player[]>>;

    // Functions

    // Room management
    joinRoom: (name: string, roomId: string) => void;
    createRoom: (hostName: string) => void;
    leaveRoom: () => void;

    // Game management
    startGame: () => void;
}

export const SocketContext = createContext<SocketContextType>({
    players: [],
    loading: true,
    currentRoom: undefined,
    currentGame: undefined,
    isConnected: false,
    events: [],
    joinRoom: () => {},
    createRoom: () => {},
    leaveRoom: () => {},
    startGame: () => {},
    setIsConnected: () => {}, 
    setEvents: () => {},
    setCurrentRoom: () => {},
    dispatchGame: () => {},
    setLoading: () => {},
    setPlayers: () => {}
});
function SocketProvider({children}: {children: React.ReactNode}) {
    const navigate: NavigateFunction = useNavigate();

    const socket: Socket = useSocket(process.env.SERVER_URL as string || "http://localhost:5170");
    const [isConnected, setIsConnected] = useState<boolean>(socket?.connected);
    const [loading, setLoading] = useState<boolean>(false);
    const [events, setEvents] = useState<any[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);

    // Current values
    const [currentRoom, setCurrentRoom] = useState<Room | undefined>();
    const [currentPlayer, setCurrentPlayer] = useState<Player | undefined>();

    const [currentGame, dispatchGame] = useReducer(gameReducer, INITIAL_GAME);
    
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

    function startGame(){
        console.log("Now starting game");
        if (currentGame)
            socket.emit('startGame', { game: currentGame, roomId: currentRoom?.id });
    }

    // Socket event callbacks
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

    function onGameStart(game: Game){
        console.log("Game starting", game);
        dispatchGame({type: GameActionKind.SET_GAME, payload: game}); // Set the currentGame
        // Navigate the player based off the gamemode
        switch(game.name){
            case 'SketchAndVote': navigate("/standardGame");
                break;
        }
    }

    // Adjust the time left on the current game
    function onTimeDecrease(newTime: number){
        dispatchGame({type: GameActionKind.SET_TIMELEFT, payload: newTime}); // Update the time left on the game
    }

    useEffect(() =>{
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
        socket.on('gameStarted', onGameStart);
        socket.on('timeDecrease', onTimeDecrease);

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
            socket.off('gameStarted', onGameStart);
            socket.off('timeDecrease', onTimeDecrease);
        }
    }, []);

    return (
        <SocketContext.Provider value={{
            loading, setLoading,
            players, setPlayers,
            events, setEvents, 
            isConnected, setIsConnected, 
            joinRoom, createRoom, leaveRoom,
            startGame,
            currentRoom, setCurrentRoom,
            currentGame, dispatchGame
        }}>
            {children}
        </SocketContext.Provider>
    );
}

export default SocketProvider;