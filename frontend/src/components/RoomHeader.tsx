import React, {} from 'react'
import { Link } from 'react-router-dom';

// Icons
import { FaArrowAltCircleLeft } from "react-icons/fa";

function RoomHeader({to="/", children}: {to: string | undefined, children: React.ReactNode}) {
    return (
        <div className='w-full flex items-center justify-between gap-3'>
            <Link to={to}><FaArrowAltCircleLeft className='text-2xl'/></Link>
            <h2 className='text-center flex-grow font-bold borderb-2 border-black text-3xl font-outline-half pr-7'>{children}</h2>
        </div>
    )
}

export default RoomHeader