import {Game} from '@def';

namespace Games{
    export enum ActionKind{
        SET_TIMELEFT = 1,
        SET_GAME = 2
    }
    
    export const INITIAL: Game = { maxTime: 30, timeLeft: 30, name: "SketchAndVote", running: false };
    
    export interface Action{
        type: ActionKind;
        payload: any;
    }
    
    export function reducer(state: Game, action: Action){
        const { type, payload }: Action = action;
        switch(type){
            case ActionKind.SET_TIMELEFT:
                return {
                    ...state, 
                    timeLeft: payload as number
                };
    
            case ActionKind.SET_GAME:
                return state = INITIAL; // Replace state with 
            default: return state;
        }
    }
}

export default Games;