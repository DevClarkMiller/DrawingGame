import { Coord } from "@def";

export type State = {
    isPainting: boolean;
    mousePos: Coord | null;
    currentImage: string | null;
    usingFill: boolean;
    strokeStyle: string;
    lineWidth: number;
}

export enum ActionKind{
    SET_PAINTING = 1,
    SET_MOUSE_POS = 2,
    SET_CURRENT_IMAGE = 3,
    SET_USING_FILL = 4,
    SET_STROKE_STYLE = 5,
    SET_LINE_WIDTH = 6,

    RESET = 50
}

export const INITIAL: State = { 
    isPainting: false,
    currentImage: null,
    lineWidth: 5,
    mousePos: null,
    strokeStyle: '#000000',
    usingFill: false,
};

export interface Action{
    type: ActionKind;
    payload?: any;
}

export function reducer(state: State, {type, payload = null}: Action){
    switch(type){
        // Setters
        case ActionKind.SET_PAINTING:
            return { ...state, isPainting: payload as boolean };
        case ActionKind.SET_USING_FILL:
            return { ...state, usingFill: payload as boolean };
        case ActionKind.SET_LINE_WIDTH:
            return { ...state, lineWidth: payload as number };
        case ActionKind.SET_STROKE_STYLE:
            return { ...state, strokeStyle: payload as string };
        case ActionKind.SET_MOUSE_POS:
            return { ...state, mousePos: payload as Coord };
        case ActionKind.SET_CURRENT_IMAGE:
            return { ...state, currentImage: payload as string };

        case ActionKind.RESET:
            return state = INITIAL; // Replace state with 
        default: return state;
    }
}