import { Player } from '@def';

namespace Players{
    export enum ActionKind{
        ADD_PLAYER = 1,
        REMOVE_PLAYER = 2,
        SET_PLAYERS = 3,
        RESET_PLAYERS = 4
    }
    
    export const INITIAL: Player[] = [];
    
    export interface Action{
        type: ActionKind;
        payload: any;
    }
    
    export function reducer(state: Player[], action: Action){
        const { type, payload }: Action = action;
        switch(type){
            case ActionKind.ADD_PLAYER:
                return [...state, payload];
            case ActionKind.REMOVE_PLAYER:
                return state.filter(player => player.name !== (payload as Player).name); // Filter out the player from the payload
            case ActionKind.SET_PLAYERS:
                return payload; // Replace state with 
            case ActionKind.RESET_PLAYERS:
                return INITIAL; // Replace state with 
            default: return state;
        }
    }
}

export default Players;