import React, { Dispatch, SetStateAction, createContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';


// Custom hooks
import { useSocket } from '../hooks/useSocket';

export type SocketContextType = {
    // State
    isConnected: boolean;
    events: any[];

    // State setters
    setIsConnected: Dispatch<SetStateAction<boolean>>;
    setEvents: Dispatch<React.SetStateAction<any[]>>;

    // Functions
    joinRoom: (name: string, roomId: string) => void;
}

export const SocketContext = createContext<SocketContextType>({
    isConnected: false,
    events: [],
    joinRoom: () => {},
    setIsConnected: () => {}, 
    setEvents: () => {}
});
function SocketProvider({children}: {children: React.ReactNode}) {
    const socket: Socket | null = useSocket(process.env.SERVER_URL as string || "http://localhost:5170");
    const [isConnected, setIsConnected] = useState<boolean>(socket?.connected);
    const [events, setEvents] = useState<any[]>([]);

    function joinRoom(name: string, roomId: string){

    }

    return (
        <SocketContext.Provider value={
        {events, setEvents, isConnected, setIsConnected, joinRoom}
        }>
            {children}
        </SocketContext.Provider>
    );
}

export default SocketProvider;