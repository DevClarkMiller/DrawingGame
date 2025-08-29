import ServerContext from './ServerContext';

// Lib imports
import loadEnv from '@lib/loadEnv';

loadEnv(); // Must call this before any env variables can be accessed

/*!Environmental variables */
const PORT: number = parseInt(process.env.PORT as string) || 5170;
export const CLIENT_URL: string = process.env.CLIENT_URL as string || "http://localhost:3000";
export const ROOM_ID_LEN: number = parseInt(process.env.ROOM_ID_LEN as string) || 12;

// Import events
import { manageRoom } from '@src/roomEvents';
import { manageGame } from '@src/gameEvents/commonGameEvents';

const ctx: ServerContext = ServerContext.Instance;

// Here we init the room and game routes
ctx.Io.on('connection', (socket) =>{
    manageRoom(socket);
    manageGame(socket);
});

ctx.Server.listen(PORT, () =>{
    console.log(`[Server] listening on ${PORT}`);
});