
/**
 * Brief: Manages the current sketch and vote game
 */

import { Game, Player } from "@def";

namespace SketchAndVote{
    // The state for sketch and vote
    export interface State{
        playersReady: number; // The number of players ready to play
    }

    export enum ActionKind{
        PLAYER_READY = 1,
        PLAYER_UNREADY = 2,
        RESET_PLAYERS_READY = 3
    }

    export const INITIAL: State = {playersReady: 0};

    export interface Action{
        type: ActionKind;
        payload: any;
    }

    export function reducer(state: State, action: Action){
        const { type, payload }: Action = action;
        switch(type){
            case ActionKind.PLAYER_READY:
                return {...state, playersReady: state.playersReady + 1}
            case ActionKind.PLAYER_UNREADY:
                return {...state, playersReady: Math.max(0, state.playersReady - 1)}
            case ActionKind.RESET_PLAYERS_READY:
                return {...state, playersReady: 0}
            default: return state;
        }
    }
}

export default SketchAndVote;