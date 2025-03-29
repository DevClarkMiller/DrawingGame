import { useContext, useMemo } from 'react';
import { Player } from '@def';

// Icons
import { MdPerson } from "react-icons/md";

// Context
import { SocketContext } from '@context/SocketProvider';

function PlayerItem({ player }: {player: Player}){
    return(
        <li className='font-bold rounded bg-light w-full p-2 text-xl flex items-center justify-between'>
            <span>{player.name}</span>
            {player.isHost && <MdPerson className='text-3xl'/>}
        </li>
    );
} 

function PlayerCount({ numPlayers, maxPlayers }: {numPlayers: number; maxPlayers: number}){
    const textColor = useMemo(() => numPlayers < maxPlayers ? "text-green-500" : "text-red-500" ,[numPlayers]);

    return(
        <div className={`playerCount text-3xl mb-3 text-center nice-trans font-bold ${textColor}`}><span>Players</span> {numPlayers} / {maxPlayers}</div>
    );
}

function PlayersList({className}: {className: string}) {
    const maxPlayers = 10;

    // Context
    const { players } = useContext(SocketContext);

    return (
        <div className={`${className}`}>
            <PlayerCount numPlayers={players?.length || 0} maxPlayers={maxPlayers}/>
            <ul className={`w-full flex flex-col items-center gap-3`}>
                {players.map(player => <PlayerItem key={player.name} player={player}/> )}
            </ul>
        </div>
    );
}

export default PlayersList;