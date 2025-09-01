import { useContext, useEffect } from 'react'

// Components
import Canvas from '@components/Canvas';
import Timer from '@components/Timer';

// Icons
import { FaPerson } from "react-icons/fa6";
import { BiSolidSquareRounded } from "react-icons/bi";

// Context
import { SocketContext } from '@context/SocketProvider';
import { AppContext } from '@src/App';

function PeopleCount({playerCount}: {playerCount: number}){
    return(
        <div className='flex items-center text-4xl'><FaPerson className='text-3xl'/>{playerCount}</div>
    );
}

// All games will be based on this, however will have additional context on top for their rules
function StandardGame({numRounds = 0, currRound = 0}: {numRounds?: number, currRound?: number}) {
    const { currentGame, players } = useContext(SocketContext);
    const { onImage } = useContext(AppContext);


    useEffect(() =>{
        console.log(`Num Rounds: ${numRounds}, Current Round: ${currRound}`);
    }, [numRounds, currRound]);

    return (
        <div className='game size-full flex flex-col items-center justify-center'>
            <div className='numRounds flex gap-1'>
                {numRounds - currRound >= 0 && [...Array(numRounds - currRound)].map((e, i) => <span className="roundsLeft text-green-500" key={i}><BiSolidSquareRounded /></span>)}
                {currRound >= 0 && [...Array(currRound)].map((e, i) => <span className="currRound text-red-500" key={i}><BiSolidSquareRounded /></span>)}   
            </div>
            <div className='flex items-center gap-3 mb-5'>
                <PeopleCount playerCount={players?.length || 0}/>
                {currentGame && <Timer timeLeft={currentGame?.timeLeft} maxTime={currentGame?.maxTime}/>}
            </div>
            <Canvas onImage={onImage} width={550} height={550}/>
        </div>
    );
}

export default StandardGame;