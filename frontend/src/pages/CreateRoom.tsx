import React, { useContext, useState, useEffect } from 'react'

// Lib
import randomName from "@lib/randomName";

// Components
import InputRow from '@components/InputRow';
import EnterRoomButton from '@components/EnterRoomButton';

// Context
import { SocketContext } from '@context/SocketProvider';
import Players from '@reducers/playerReducer';

function CreateRoom() {
    // Context
    const { createRoom, dispatchPlayers, leaveRoom } = useContext(SocketContext);

    // State
    const [hostName, setHostName] = useState<string>(randomName());


    function onCreate(e: React.SyntheticEvent<HTMLFormElement>){
        e.preventDefault();
        createRoom(hostName);
    }

    // Empty out the player in case of stale state
    useEffect(() =>{ 
        dispatchPlayers({type: Players.ActionKind.RESET_PLAYERS, payload: null});
        leaveRoom();
    }, []);

    return (
        <form className='w-full h-full lg:w-2/3 flex flex-col flex-grow items-center justify-between gap-3 card-gradient p-5 rounded-md'onSubmit={onCreate}>
            <div className='font-semibold h-full w-full flex flex-col justify-center items-center flex-grow p-2 bg-secondary rounded-lg shadow-lg ring-1 backdrop-blur-lg opacity-90 gap-3'>
                <h2 className='mb-6 text-xl font-bold'>You're the boss, just pick a good name 😛</h2>
                <table className='w-5/6 md:w-2/3 lg:w-1/2'>
                    <tbody className='font-semibold'>
                            <InputRow 
                                name='Name'
                                inputClassName='text-input'
                                inputProps={{
                                    placeholder: "Cool name goes here",
                                    value: hostName,
                                    onChange: e => setHostName(e.target.value),
                                    required: true
                                }}
                            >Name</InputRow>
                    </tbody>
                </table>
                <EnterRoomButton to='/joinRoom' linkText='Join Room'>Create Room</EnterRoomButton>
            </div>
        </form>
    );
}

export default CreateRoom;