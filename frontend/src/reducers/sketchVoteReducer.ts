
/**
 * Brief: Manages the current sketch and vote games context
*/

namespace SketchAndVote{
    // The state for sketch and vote
    export interface State{
        playersReady: number; // The number of players ready to play
        imageOptions: string[];
        selectedImage: string;
        loading: boolean;
        pickTime: number;
    }

    export enum ActionKind{
        PLAYER_READY = 1,
        PLAYER_UNREADY = 2,
        SET_IMAGE_OPTIONS = 3,
        SET_SELECTED_IMAGE = 4,
        SET_LOADING = 5,
        SET_PICK_TIME = 6,
        RESET_PLAYERS_READY = 15
    }

    export const INITIAL: State = { playersReady: 0, imageOptions: [], selectedImage: "", loading: false, pickTime: 45 };

    export interface Action{
        type: ActionKind;
        payload?: any;
    }

    export function reducer(state: State, { type, payload }: Action){
        switch(type){
            case ActionKind.PLAYER_READY:
                return {...state, playersReady: state.playersReady + 1}
            case ActionKind.PLAYER_UNREADY:
                return {...state, playersReady: Math.max(0, state.playersReady - 1)}
            case ActionKind.SET_IMAGE_OPTIONS:
                return {...state, imageOptions: payload};
            case ActionKind.SET_SELECTED_IMAGE:
                return {...state, selectedImage: payload};
            case ActionKind.SET_LOADING:
                return {...state, loading: payload};
            case ActionKind.SET_PICK_TIME: 
                return {...state, pickTime: payload}
            case ActionKind.RESET_PLAYERS_READY:
                return {...state, playersReady: 0}
            default: return state;
        }
    }
}

export default SketchAndVote;