import { useMemo, useContext } from 'react'

// Types
import { Game, Player } from '@def';

// Components
import Canvas from '@components/Canvas';

// Icons
import { FaClock } from "react-icons/fa";
import { FaPerson } from "react-icons/fa6";

// Context
import { SocketContext } from '@context/SocketProvider';

// The bar that will be on top of the canvas
function Timer({currentGame}: {currentGame: Game | undefined}){
    const timeLeftColor = useMemo(() =>{
        if (!currentGame) return 'text-green-600'; // If no game is found, just assume everything is peachy

        if (currentGame.timeLeft >= currentGame.maxTime * 0.8) return 'text-green-600';
        else if (currentGame.timeLeft >= currentGame.maxTime * 0.5) return 'text-yellow-600';
        else if (currentGame.timeLeft >= currentGame.maxTime * 0.2) return 'text-orange-600';
        return 'text-red-600'; // Means that like no time is left at all
    }, [currentGame]);

    return(
        <div className='flex items-center text-light text-4xl'>
            <FaClock className='mr-3 pt-1 text-4xl'/>
            <span className={`${timeLeftColor} nice-trans`}>{currentGame?.timeLeft}</span>/ <span>{currentGame?.maxTime}</span>
        </div>
    );
}

function PeopleCount({playerCount}: {playerCount: number}){
    return(
        <div className='flex items-center text-4xl'><FaPerson className='text-3xl'/>{playerCount}</div>
    );
}

// All games will be based on this, however will have additional context on top for their rules
function StandardGame() {
    const { currentGame, players } = useContext(SocketContext);

    return (
        <div className='game size-full flex flex-col items-center justify-center'>
            <div className='flex items-center gap-3 mb-5'>
                <PeopleCount playerCount={players?.length || 0}/>
                <Timer currentGame={currentGame}/>
            </div>
            <Canvas width={550} height={550}/>
        </div>
    );
}

export  default StandardGame;