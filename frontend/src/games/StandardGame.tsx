import { useContext } from 'react'

// Components
import Canvas from '@components/Canvas';
import Timer from '@components/Timer';

// Icons
import { FaPerson } from "react-icons/fa6";


// Context
import { SocketContext } from '@context/SocketProvider';

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
                {currentGame && <Timer timeLeft={currentGame?.timeLeft} maxTime={currentGame?.maxTime}/>}
            </div>
            <Canvas width={550} height={550}/>
        </div>
    );
}

export  default StandardGame;