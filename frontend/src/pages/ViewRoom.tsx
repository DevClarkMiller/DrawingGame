import React, { useEffect, useContext, useState } from 'react'
import { useNavigate, NavigateFunction } from 'react-router-dom';

// Icons
import { FaLink } from 'react-icons/fa';

// Components
import PlayersList from '../components/PlayersList';

// Context
import { SocketContext } from '../context/SocketProvider';

function ViewRoom() {
    const navigate: NavigateFunction = useNavigate();
    const { loading, currentRoom } = useContext(SocketContext);
    const [inviteColor, setInviteColor] = useState<string>("text-main");

    function onCopyInvite(){
        if (currentRoom?.url){
            navigator.clipboard.writeText(currentRoom.url);
            setInviteColor('text-green-500');

            setTimeout(() =>{
                setInviteColor('text-main');
            }, 1500);
        }
    }

    useEffect(() =>{
        if (!loading && !currentRoom)
            navigate('/createRoom');
    }, [currentRoom]);

    return (
        <div className='w-full flex flex-col items-center gap-3'>
            <h2 className='font-bold borderb-2 border-black pb-5 text-3xl'>Manage Room</h2>
            <PlayersList className='size-full lg:w-1/2'/>
            <button onClick={onCopyInvite} className='flex items-center gap-3 nice-trans'><span>Copy Invite</span><FaLink className={`text-xl ${inviteColor}`}/></button>
        </div>
    );
}

export default ViewRoom;