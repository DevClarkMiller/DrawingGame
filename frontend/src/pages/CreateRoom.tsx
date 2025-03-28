import React, { useContext, useState, useEffect } from 'react'

// Lib
import randomName from '../../lib/randomName';

// Components
import LabeledInput from '../components/LabeledInput';

// Context
import { SocketContext } from '../context/SocketProvider';

function CreateRoom() {
    // Context
    const { createRoom, setPlayers, leaveRoom } = useContext(SocketContext);

    // State
    const [hostName, setHostName] = useState<string>(randomName());


    function onCreate(e: React.SyntheticEvent<HTMLFormElement>){
        e.preventDefault();
        createRoom(hostName);
    }

    // Empty out the player in case of stale state
    useEffect(() =>{ 
        setPlayers([]); 
        leaveRoom();
    }, []);

    return (
        <form className='w-full h-full lg:w-2/3 flex flex-col flex-grow items-center justify-between gap-3 card-gradient p-5 rounded-md'onSubmit={onCreate}>
            <div className='font-semibold h-full w-full flex flex-col justify-center items-center flex-grow p-2 bg-secondary rounded-lg shadow-lg ring-1 backdrop-blur-lg opacity-90 gap-3'>
             <h2 className='mb-6 text-xl font-bold'>You're the boss, just pick a good name 😛</h2>
                <LabeledInput 
                    inputClassName='bg-white rounded text-input'   
                    inputProps={{
                        required: true,
                        value: hostName,
                        onChange: e => setHostName(e.target.value)
                    }}      
                    name='HostName'>
                Name</LabeledInput>
                <button type='submit'>Create Room</button>
            </div>
        </form>
    );
}

export default CreateRoom;