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
}