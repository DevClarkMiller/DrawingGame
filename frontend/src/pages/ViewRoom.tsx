import React, { useEffect, useContext, useState } from 'react'
import { useNavigate, NavigateFunction } from 'react-router-dom';

// Icons
import { FaLink } from 'react-icons/fa';

// Components
import PlayersList from '@components/PlayersList';
import RoomHeader from '@components/RoomHeader';

// Context
import { SocketContext } from '@context/SocketProvider';

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
        if (!loading && !currentRoom) navigate('/');
    }, [currentRoom]);

    return (
        <div className='card card-gradient'>
            <div className='inner-card justify-between p-5'>
                <RoomHeader to='/joinRoom'>Room</RoomHeader>
                <PlayersList className='size-full lg:w-1/2 flex-grow'/>
                <button onClick={onCopyInvite} className='flex items-center gap-3 nice-trans'><span>Copy Invite</span><FaLink className={`text-xl ${inviteColor}`}/></button>
            </div>
        </div>
    );
}

export default ViewRoom;