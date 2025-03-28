import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate, NavigateFunction } from 'react-router-dom';

// Icons
import { FaLink } from "react-icons/fa";

// Types
import { Game } from '../def';

// Components
import PlayersList from '../components/PlayersList';
import RoomHeader from '../components/RoomHeader';

// Context
import { SocketContext } from '../context/SocketProvider';

function ManageRoom() {
    const navigate: NavigateFunction = useNavigate();
    const { players, loading, currentRoom, setCurrentGame, startGame } = useContext(SocketContext);
    const [inviteColor, setInviteColor] = useState<string>("text-main");

    const canStart = useMemo(() => players?.length > 1, [players]);

    function onCopyInvite(){
        if (currentRoom?.url){
            navigator.clipboard.writeText(currentRoom.url);
            setInviteColor('text-green-500');

            setTimeout(() =>{
                setInviteColor('text-main');
            }, 1500);
        }
    }

    // Placeholder for now, eventually let users pick the game type
    useEffect(() =>{
        setCurrentGame({timeLeft: 60, maxTime: 60});
    }, []);

    useEffect(() =>{
        if (!loading && !currentRoom) navigate('/');
    }, [currentRoom]);

    return (
        <div className='card card-gradient'>
            <div className='inner-card justify-between p-5'>
                <RoomHeader to='/'>Manage Room</RoomHeader>
                <PlayersList className='size-full lg:w-1/2 flex-grow'/>
                <div className='flex gap-3'>
                    <button className={`nice-trans text-white ${canStart ? "!bg-green-500" : "!bg-red-500"}`} onClick={startGame} disabled={!canStart}>Start</button>
                    <button onClick={onCopyInvite} className='flex items-center gap-3 nice-trans'><span>Copy Invite</span><FaLink className={`text-xl ${inviteColor}`}/></button>
                </div>
            </div>
        </div>
    );
}

export default ManageRoom;