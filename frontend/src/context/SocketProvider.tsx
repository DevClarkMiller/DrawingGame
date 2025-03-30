import React, { Dispatch, SetStateAction, createContext, useEffect, useState, useReducer } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';

import { Logger } from '@lib/logger';

// Types
import { Room, Player, Game } from '@def';

// Reducers
import Games from '@reducers/gameReducer';
import Players from '@reducers/playerReducer';
import SketchAndVote from '@reducers/sketchVoteReducer';

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
    sketchVote: SketchAndVote.State;

    // State setters
    setIsConnected: Dispatch<SetStateAction<boolean>>;
    setEvents: Dispatch<SetStateAction<any[]>>;
    setCurrentRoom: Dispatch<SetStateAction<Room | undefined>>;
    dispatchGame: React.ActionDispatch<[action: Games.Action]>;
    dispatchPlayers: React.ActionDispatch<[action: Players.Action]>;
    setLoading: Dispatch<SetStateAction<boolean>>;

    // Room management
    joinRoom: (name: string, roomId: string) => void;
    createRoom: (hostName: string) => void;
    leaveRoom: () => void;

    // Game management
    startGame: () => void;
    parseSentence: (sentence: string) => void;
}

export const SocketContext = createContext<SocketContextType>({} as SocketContextType);
function SocketProvider({logger, children}: {logger: Logger, children: React.ReactNode}) {
    const navigate: NavigateFunction = useNavigate();

    const socket: Socket = useSocket(process.env.SERVER_URL as string || "http://localhost:5170");
    const [isConnected, setIsConnected] = useState<boolean>(socket?.connected);
    const [loading, setLoading] = useState<boolean>(false);
    const [events, setEvents] = useState<any[]>([]);

    // Current values
    const [currentRoom, setCurrentRoom] = useState<Room | undefined>();
    const [currentPlayer, setCurrentPlayer] = useState<Player | undefined>();

    const [currentGame, dispatchGame] = useReducer(Games.reducer, Games.INITIAL);
    const [players, dispatchPlayers] = useReducer(Players.reducer, Players.INITIAL);
    const [sketchVote, dispatchSketchVote] = useReducer(SketchAndVote.reducer, SketchAndVote.INITIAL);
    
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
        logger.log("Creating room");
    }

    function leaveRoom(){
        setLoading(true);
        setCurrentPlayer(undefined);
        socket.disconnect();
        socket.connect(); // Reconnect
    }

    function startGame(){
        if (currentGame)
            socket.emit('startGame', { game: currentGame, roomId: currentRoom?.id });
    }

    function parseSentence(sentence: string){
        socket.emit('parseSentence', sentence);
    }

    // Event callbacks

    function onCreatedRoom(room: Room){
        if (currentPlayer) // Player will be given a name and has the isHost boolean set before this is called
            setCurrentPlayer({...currentPlayer, roomId: room.id}); // Set the roomId on current player
        setCurrentRoom(room);
        setLoading(false);
        navigate('/manageRoom');
    }

    function onJoinedRoom(room: Room){
        setLoading(false);
        setCurrentRoom(room);
        navigate('/viewRoom');
    }

    function onPlayerJoined(player: Player){         
        if (player.name != currentPlayer?.name)   
            dispatchPlayers({type: Players.ActionKind.ADD_PLAYER, payload: player});
    }

    function onRoomNotFound(msg: string){
        setCurrentPlayer(undefined);
        alert(msg);
    }

    function onPlayerLeft(player: Player){
        dispatchPlayers({type: Players.ActionKind.REMOVE_PLAYER, payload: player});
    }

    function onNameTaken(msg: string){
        setLoading(false);
        alert(msg);
    }

    function onExitRoom(msg: string){
        if (currentPlayer) navigate(currentPlayer.isHost ? "/" : "/joinRoom");
        else navigate('/');
    }

    function onGameStart(game: Game){
        logger.log("Game starting", game);
        dispatchGame({type: Games.ActionKind.SET_GAME, payload: game}); // Set the currentGame
        // Navigate the player based off the gamemode
        switch(game.name){
            case 'SketchAndVote': navigate("/standardGame");
                break;
        }
    }

    function onSentenceParsed(urls: string[]){
        logger.log(urls);
        dispatchSketchVote({type: SketchAndVote.ActionKind.SET_IMAGE_OPTIONS, payload: urls});
    }

    useEffect(() =>{
        // Note that some of the callbacks are defined here, this is if they're simple, else they get their own dedicated function
        const socketEvents: [name: string, callBack: (...args: any[]) => void][] = [
            // Standard Socket Events
            ['connect', () => setIsConnected(true)],
            ['disconnect', () => setIsConnected(false)],

            // Room Events
            ['playerJoined', onPlayerJoined],
            ['createdRoom', onCreatedRoom],
            ['roomNotFound', onRoomNotFound],
            ['playerLeft', onPlayerLeft],
            ['joinedRoom', onJoinedRoom],
            ['nameTaken', onNameTaken],
            ['exitRoom', onExitRoom],
            ['playerList', (playerList: Player[]) => dispatchPlayers({type: Players.ActionKind.SET_PLAYERS, payload: playerList})],
            
            // Game Events
            ['gameStarted', onGameStart],
            ['sentenceParsed', onSentenceParsed],

            // Update the time left on the game
            ['timeDecrease', (newTime: number) =>  dispatchGame({type: Games.ActionKind.SET_TIMELEFT, payload: newTime})] 
        ];

        // Turn on each event
        socketEvents.forEach((socketEvent) =>{
            socket.on(socketEvent[0], socketEvent[1]);
        });

        return () =>{
            // Turn off each event
            socketEvents.forEach((socketEvent) =>{
                socket.off(socketEvent[0], socketEvent[1]);
            });
        }
    }, []);

    return (
        <SocketContext.Provider value={{
            loading, setLoading,
            players, dispatchPlayers,
            events, setEvents, 
            isConnected, setIsConnected, 
            joinRoom, createRoom, leaveRoom,
            startGame, parseSentence, sketchVote,
            currentRoom, setCurrentRoom,
            currentGame, dispatchGame
        }}>
            {children}
        </SocketContext.Provider>
    );
}

export default SocketProvider;