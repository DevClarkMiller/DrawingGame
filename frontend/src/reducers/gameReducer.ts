import {Game} from '@def';

export enum GameActionKind{
    SET_TIMELEFT = 1,
    SET_GAME = 2
}

export const INITIAL_GAME: Game = { maxTime: 60, timeLeft: 60, name: "SketchAndVote", running: false };

export interface GameAction{
    type: GameActionKind;
    payload: any;
}

export function gameReducer(state: Game, action: GameAction){
    const { type, payload }: GameAction = action;
    switch(type){
        case GameActionKind.SET_TIMELEFT:
            return {
                ...state, 
                timeLeft: payload as number
            };

        case GameActionKind.SET_GAME:
            return state = INITIAL_GAME; // Replace state with 
        default: return state;
    }
}