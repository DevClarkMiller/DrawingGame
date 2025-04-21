
/**
 * Brief: Manages the current sketch and vote games context
*/

namespace SketchAndVote{
    // The state for sketch and vote

    export interface State{
        playersReady: number; // The number of players ready to play
        imageOptions: string[];
        selectedImage: string; // This var is reused for the image in each round
        loading: boolean;
        pickTime: number;
        finalSketchOrder: string[];
        finalSketch?: {image: string, sketches: Array<any>};
    }

    export enum ActionKind{
        PLAYER_READY = 1,
        PLAYER_UNREADY = 2,
        SET_IMAGE_OPTIONS = 3,
        SET_SELECTED_IMAGE = 4,
        SET_LOADING = 5,
        SET_PICK_TIME = 6,
        SET_SKETCH_ORDER = 7,
        SET_FINAL_SKETCH = 8,

        RESET_PLAYERS_READY = 15
    }

    export const INITIAL: State = { playersReady: 0, imageOptions: [], selectedImage: "", loading: false, pickTime: 15, finalSketchOrder: ["https://i.ytimg.com/vi/DK7CVqbtW0A/hqdefault.jpg?sqp=-oaymwEmCOADEOgC8quKqQMa8AEB-AH-BIAC4AOKAgwIABABGEAgXihyMA8=&rs=AOn4CLDUC4JByaJ1giPHG-hyUF3Z_DWUQA", "https://i.scdn.co/image/ab67616d0000b273bbdea76b4aac1e9afd83117f"], finalSketch: {image: "https://i.ytimg.com/vi/DK7CVqbtW0A/hqdefault.jpg?sqp=-oaymwEmCOADEOgC8quKqQMa8AEB-AH-BIAC4AOKAgwIABABGEAgXihyMA8=&rs=AOn4CLDUC4JByaJ1giPHG-hyUF3Z_DWUQA", sketches: [["Mbfrk", ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdsejAeo2CyYWtGxQG7PZ9Rz-8aiqlMKH5xg&s"]]]} };

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
            case ActionKind.SET_SKETCH_ORDER: 
                // Here each of the final images will be set, however their state sketches values won't be filled yet. That comes from the host clicking the next button
                const finalSketchOrder: string[] = payload;
                return {...state, finalSketchOrder: finalSketchOrder};
            case ActionKind.SET_FINAL_SKETCH:
                return {...state, finalSketch: payload};
            default: return state;
        }
    }
}

export default SketchAndVote;