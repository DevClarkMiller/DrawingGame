export type Room = {
    id: string;
    url: string;
}

export type Player = {
    name?: string; // If not provided, a random one will be generated
    isHost: boolean;
    roomId: string;
}

export type Message = {
    author: string;
    text: string;
}

export type Game = {
    name: "SketchAndVote"; // Acts like a string enum, more values will be added as more minigames are added
    timeLeft: number;
    maxTime: number;
    running: boolean;
}

// Canvas types

export type Coord = {
    x: number;
    y: number;
}

export interface Color{
    r: number;
    g: number;
    b: number;
    a: number;
}

export class PixelManager{
    private data: Uint8ClampedArray<ArrayBufferLike>
    private width: number;

    public constructor(data: Uint8ClampedArray<ArrayBufferLike>, width: number){
        this.data = data;
        this.width = width;
    }

    public setData(data: Uint8ClampedArray<ArrayBufferLike>) { this.data = data; }

    index(x: number, y: number){ return (y * this.width + x) * 4; }

    public getPixel(x:number, y:number): Color{
        const i: number = this.index(x, y);
        return { r: this.data[i], g: this.data[i + 1], b: this.data[i + 2], a: this.data[i + 3] };
    };

    public setPixel(x: number, y: number, color: Color){
        const i = this.index(x, y);
        this.data[i] = color.r;
        this.data[i + 1] = color.g;
        this.data[i + 2] = color.b;
        this.data[i + 3] = color.a;
    }
}