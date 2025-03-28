import React from 'react'
import { Link } from 'react-router-dom';

// Icons
import { FaPlay } from "react-icons/fa";

function EnterRoomButton({to, linkText, children}: {to: string, linkText: string, children: React.ReactNode}) {
    return (
        <div className='flex items-center gap-3'>
            <button type='submit' className='flex items-center gap-3'><span>{children}</span><FaPlay /></button>
            <Link to={to} className="underline text-xl">{linkText}</Link>
        </div>
    );
}

export default EnterRoomButton;