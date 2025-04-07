import React from 'react'

// Custom hooks
import useColorRatio from '@hooks/useColorRatio';

// Icons
import { FaClock } from "react-icons/fa";

function Timer({timeLeft, maxTime}: {timeLeft: number, maxTime: number}) {
    const timeLeftColor = useColorRatio(
        timeLeft ?? 0,
        maxTime ?? 1 // prevent division by 0
    );

    return(
        <div className='flex items-center text-light text-4xl'>
            <FaClock className='mr-3 pt-1 text-4xl'/>
            <span className={`${timeLeftColor} nice-trans`}>{timeLeft}</span>/ <span>{maxTime}</span>
        </div>
    );
}

export default Timer;