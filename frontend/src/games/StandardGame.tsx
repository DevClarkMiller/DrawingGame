import React, { useMemo } from 'react'

// Components
import Canvas from '../components/Canvas';

// Icons
import { FaClock } from "react-icons/fa";

// Types
interface StandardGameProps{
    timeLeft: number;
    maxTime: number;
}

// All games will be based on this, however will have additional context on top for their rules
function StandardGame({timeLeft = 60, maxTime = 60}: StandardGameProps) {
    const timeLeftColor = useMemo(() =>{
        if (timeLeft >= maxTime * 0.8) return 'text-green-600';
        else if (timeLeft >= maxTime * 0.5) return 'text-yellow-600';
        else if (timeLeft >= maxTime * 0.2) return 'text-orange-600';
        return 'text-red-600'; // Means that like no time is left at all
    }, [timeLeft, maxTime]);

    return (
        <div className='game size-full flex flex-col items-center justify-center'>
            <div className='flex items-center text-light text-4xl mb-5'><FaClock className='mr-3 pt-1 text-4xl'/><span className={`${timeLeftColor} nice-trans`}>{timeLeft}</span> / <span>{maxTime}</span></div>
            <Canvas width={500} height={500}/>
        </div>
    );
}

export  default StandardGame;