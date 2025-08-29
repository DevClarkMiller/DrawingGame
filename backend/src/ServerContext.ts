/**
 * Purpose: Acts as a singleton / facade holding game state, also has some methods to acomplish this :P
 * Author: Clark Miller
 */

import express, { Application } from 'express';
import http from 'http';

import SentenceParser from '@lib/sentenceParser';

import { Player, RoomDetails, GameSession } from '@def';
import Gamemode from './gamemodes/GameMode';
import { Socket, Server, DefaultEventsMap } from 'socket.io';

export type IoServer = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
export type SocketType = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

export type RoomDetailsMap = Map<string, RoomDetails>;
export type PlayerMap = Map<string, Player>;
export type GameSessionMap = Map<string, GameSession>;
export type GamemodesMap = Map<string, Gamemode>;
export type HttpServer = http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;

export default class ServerContext{
    // STATIC MEMBERS
    private static _instance : ServerContext | null = null;
    
    // INSTANCE MEMBERS
    private _rooms: Map<string, RoomDetails>;
    private _players: Map<string, Player>; // Socket ids mapped to their players
    private _games: Map<string, GameSession>; // Key is the roomId of the game
    private _activeGamemodes: Map<string, Gamemode>; // Key is roomid
    private _app: Application;
    private _io: IoServer;
    private _server: HttpServer;

    private _sentenceParser: SentenceParser;

    // PROPERTIES
    get Rooms(): RoomDetailsMap { return this._rooms; }
    set Rooms(val: RoomDetailsMap) { this._rooms = val; }

    get Players(): PlayerMap { return this._players; }
    set Players(val: PlayerMap) { this._players = val; }

    get Games(): GameSessionMap{ return this._games; }
    set Games(val: GameSessionMap) { this._games = val; }
    
    get ActiveGamemodes(): GamemodesMap { return this._activeGamemodes; }
    set ActiveGamemodes(val: GamemodesMap) { this._activeGamemodes = val; }

    get App(): Application { return this._app; }
    set App(val: Application) { this._app = val; }

    get Io(): IoServer { return this._io; }
    set Io(val: IoServer) { this._io = val; }

    get Server(): HttpServer { return this._server; }
    set Server (val: HttpServer) { this._server = val; }

    get SentenceParser(): SentenceParser { return this._sentenceParser; }  

    static get Instance(): ServerContext { 
        if (ServerContext._instance == null) ServerContext._instance = new ServerContext();
        return ServerContext._instance;
    }

    // FUNCTIONS

    public GetActiveGamemode(roomid: string): Gamemode { return this._activeGamemodes.get(roomid) as Gamemode; }
    public GetRoom(roomid: string): RoomDetails | undefined{ return this._rooms.get(roomid); }
    public GetPlayer(socketid: string): Player | undefined { return this._players.get(socketid); }

    // CTORS
    private constructor(){
        this._rooms = new Map<string, RoomDetails>();
        this._players = new Map<string, Player>();
        this._games = new Map<string, GameSession>();
        this._activeGamemodes = new Map<string, Gamemode>();

        this._app = express();
        this._server = http.createServer(this._app);
        this._io = new Server(this._server, {cors: { origin: "*" }});

        this._sentenceParser = new SentenceParser();
    }
}