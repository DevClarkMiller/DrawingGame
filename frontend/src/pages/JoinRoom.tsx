import React, { useContext, InputHTMLAttributes, LabelHTMLAttributes, useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom';

// Lib
import randomName from '../../lib/randomName';

// Components
import InputRow from '../components/InputRow';

// Icons
import { FaPlay } from "react-icons/fa";

// Context
import { SocketContext } from '../context/SocketProvider';

function JoinRoom() {
    const { joinRoom, setPlayers, leaveRoom } = useContext(SocketContext);
    const initialRoomId = useMemo(() =>{
        const query = new URLSearchParams(location.search);
        return query.get('roomId') || "";
    }, []);

    // State
    const [name, setName] = useState<string>(randomName());
    const [roomId, setRoomId] = useState<string>(initialRoomId);


    function onJoin(e: React.SyntheticEvent<HTMLFormElement>){
        e.preventDefault();
        joinRoom(name, roomId);
    }

    // Empty out the player in case of stale state
    useEffect(() =>{ 
        setPlayers([]); 
        leaveRoom();
    }, []);

    return (
        <form className='w-full h-full lg:w-2/3 flex flex-col flex-grow items-center justify-between gap-3 card-gradient p-5 rounded-lg' onSubmit={onJoin}>
            <div className='h-full w-full flex flex-col justify-center items-center flex-grow p-2 bg-secondary rounded-lg shadow-lg ring-1 backdrop-blur-lg opacity-90'>
                <h2 className='mb-6 text-xl font-bold'>Choose your name and join a room 🥳</h2>
                <table className='w-full md:w-2/3 lg:w-1/2'>
                    <tbody className='font-semibold'>
                        <InputRow 
                            name='Name'
                            inputClassName='text-input'
                            inputProps={{
                                placeholder: "Cool name goes here",
                                value: name,
                                onChange: e => setName(e.target.value),
                                required: true
                            }}
                        >Name</InputRow>
                        {!initialRoomId &&
                            <InputRow 
                                name='RoomId'
                                inputClassName='text-input'
                                inputProps={{
                                    placeholder: "RoomID goes here",
                                    value: roomId,
                                    onChange: e => setRoomId(e.target.value),
                                    required: true
                                }}
                            >Room ID</InputRow>
                        }
                    </tbody>
                </table>
                <div className='flex items-center gap-3'>
                    <button type='submit' className='flex items-center gap-3'><span>Join Room</span><FaPlay /></button>
                    <Link to="/" className="underline text-xl">Create Room</Link>
                </div>
            </div>
        </form>
    );
}

export default JoinRoom;