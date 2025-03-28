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
    timeLeft: number;
    maxTime: number;
}