import {  Game } from "@src/def";
import Gamemode from "@src/gamemodes/GameMode";
import { SketchAndVote } from "@src/gamemodes/SketchAndVote";
import { Server, DefaultEventsMap } from "socket.io";

export function gameFactory(game: Game, games: Map<string, Game>, roomId: string, io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>): Gamemode{
    switch(game.name){
        case "SketchAndVote":
            return new SketchAndVote(game, games, roomId, io);
    }
}