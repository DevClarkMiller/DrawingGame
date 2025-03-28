import React, { useEffect, useMemo, useContext } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom';

// Types
import { Game } from '../def';

// Components
import Canvas from '../components/Canvas';

// Icons
import { FaClock } from "react-icons/fa";

// Context
import { SocketContext } from '../context/SocketProvider';

// Types
interface StandardGameProps{
    gameFinishedPath: string;
}

// All games will be based on this, however will have additional context on top for their rules
function StandardGame({gameFinishedPath = "/"}: StandardGameProps) {
    const { currentGame } = useContext(SocketContext);
    const navigate: NavigateFunction = useNavigate();

    const timeLeftColor = useMemo(() =>{
        if (currentGame){
            if (currentGame.timeLeft >= currentGame.maxTime * 0.8) return 'text-green-600';
            else if (currentGame.timeLeft >= currentGame.maxTime * 0.5) return 'text-yellow-600';
            else if (currentGame.timeLeft >= currentGame.maxTime * 0.2) return 'text-orange-600';
            return 'text-red-600'; // Means that like no time is left at all
        }
        return 'text-green-600';
    }, [currentGame]);

    // useEffect(() =>{
    //     console.log(currentGame);
    // }, [currentGame]);

    return (
        <div className='game size-full flex flex-col items-center justify-center'>
            <div className='flex items-center text-light text-4xl mb-5'><FaClock className='mr-3 pt-1 text-4xl'/><span className={`${timeLeftColor} nice-trans`}>{currentGame?.timeLeft}</span> / <span>{currentGame?.maxTime}</span></div>
            <Canvas width={550} height={550}/>
        </div>
    );
}

export  default StandardGame;