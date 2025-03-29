import { Dispatch, SetStateAction } from "react";
import { NavigateFunction } from "react-router-dom";

// Types
import { Player, Room } from "@def";

interface OnCreatedRoomParams{
    currentPlayer: Player;
    room: Room;

    // State function
    setCurrentRoom: React.Dispatch<React.SetStateAction<Room | undefined>>;
    setLoading: Dispatch<SetStateAction<boolean>>;
    setCurrentPlayer: Dispatch<React.SetStateAction<Player | undefined>>;

    // Hooks
    navigate: NavigateFunction;
    
}
function onCreatedRoom({currentPlayer, room, setLoading, setCurrentRoom, setCurrentPlayer, navigate}: OnCreatedRoomParams){
    if (currentPlayer) // Player will be given a name and has the isHost boolean set before this is called
        setCurrentPlayer({...currentPlayer, roomId: room.id}); // Set the roomId on current player
    setCurrentRoom(room);
    setLoading(false);
    navigate('/manageRoom');
    console.log(room);
}