import { Coord } from "@def";

export type State = {
    isPainting: boolean;
    mousePos: Coord | null;
    currentImage: string | null;
    usingFill: boolean;
    strokeStyle: string;
    lineWidth: number;
    history: string[];
}

export enum ActionKind{
    SET_PAINTING = 1,
    SET_MOUSE_POS = 2,
    SET_CURRENT_IMAGE = 3,
    SET_USING_FILL = 4,
    SET_STROKE_STYLE = 5,
    SET_LINE_WIDTH = 6,
    ADD_HISTORY = 7,

    RESET = 50
}

export const INITIAL: State = { 
    isPainting: false,
    currentImage: null,
    lineWidth: 5,
    mousePos: null,
    strokeStyle: '#000000',
    usingFill: false,
    history: []
};

export interface Action{
    type: ActionKind;
    payload?: any;
}

export function reducer(state: State, {type, payload = null}: Action){
    switch(type){
        // Setters
        case ActionKind.SET_PAINTING:
            return { ...state, isPainting: payload };
        case ActionKind.SET_USING_FILL:
            return { ...state, usingFill: payload };
        case ActionKind.SET_LINE_WIDTH:
            return { ...state, lineWidth: payload };
        case ActionKind.SET_STROKE_STYLE:
            return { ...state, strokeStyle: payload };
        case ActionKind.SET_MOUSE_POS:
            return { ...state, mousePos: payload };
        case ActionKind.SET_CURRENT_IMAGE:
            return { ...state, currentImage: payload };
        case ActionKind.ADD_HISTORY: 
            return { ...state, history: [...state.history, payload]} // Appends image to history

        case ActionKind.RESET:
            return state = INITIAL; // Replace state with 
        default: return state;
    }
}