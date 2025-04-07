import { useMemo, useContext } from 'react'

// Types
import { Game, Player } from '@def';

// Components
import Canvas from '@components/Canvas';

// Icons
import { FaClock } from "react-icons/fa";
import { FaPerson } from "react-icons/fa6";

// Custom hooks
import useColorRatio from '@hooks/useColorRatio';

// Context
import { SocketContext } from '@context/SocketProvider';

// The bar that will be on top of the canvas
function Timer({currentGame}: {currentGame: Game | undefined}){
    const timeLeftColor = useColorRatio(
        currentGame?.timeLeft ?? 0,
        currentGame?.maxTime ?? 1 // prevent division by 0
    );

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