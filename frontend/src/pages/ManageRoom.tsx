import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, NavigateFunction } from 'react-router-dom';

// Icons
import { FaLink } from "react-icons/fa";

// Context
import { SocketContext } from '../context/SocketProvider';

function ManageRoom() {
    const navigate: NavigateFunction = useNavigate();
    const { loading, currentRoom } = useContext(SocketContext);
    const [inviteColor, setInviteColor] = useState<string>("text-main");
    //

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
        <div>
            ManageRoom
            <button onClick={onCopyInvite} className='flex items-center gap-3 nice-trans'><span>Copy Invite</span><FaLink className={`text-xl ${inviteColor}`}/></button>
        </div>
    );
}

export default ManageRoom;