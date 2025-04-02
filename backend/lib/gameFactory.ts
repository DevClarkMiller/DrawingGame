import {  Game, GameSession } from "@src/def";
import Gamemode from "@src/gamemodes/GameMode";
import { SketchAndVote } from "@src/gamemodes/SketchAndVote";
import { Server, DefaultEventsMap } from "socket.io";

export function gameFactory(gameSession: GameSession, games: Map<string, GameSession>, roomId: string, io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>): Gamemode{
    
    switch(gameSession.game.name){
        case "SketchAndVote":
            return new SketchAndVote(gameSession, games, roomId, io);
    }
}