import React, { useContext, InputHTMLAttributes, LabelHTMLAttributes, useMemo, useState, useEffect } from 'react'

// Lib
import randomName from '../lib/randomName';

// Context
import { SocketContext } from '../context/SocketProvider';

type LabeledInputProps = {
    name: string;
    labelClassName?: string;
    inputClassName?: string;
    children: React.ReactNode;
    labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
    inputProps?: InputHTMLAttributes<HTMLInputElement>;
};


function LabeledInput(
    {name = "", labelClassName = "", inputClassName = "", children, labelProps, inputProps}: LabeledInputProps
){
    return (
        <div className='flex items-center gap-5'>
            <label htmlFor={name} className={labelClassName} {...labelProps}>{children}</label>
            <input id={name} name={name} className={inputClassName} {...inputProps}></input>
        </div>
    );
}

type InputRowProps = {
    name: string;
    labelClassName?: string;
    inputClassName?: string;
    children: React.ReactNode;
    labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
    inputProps?: InputHTMLAttributes<HTMLInputElement>;
};
function InputRow({name = "", labelClassName = "", inputClassName = "", children, labelProps, inputProps}: InputRowProps){
    return(
        <tr>
            <th className='flex'><label htmlFor={name} className={`w-full h-full text-left ${labelClassName}`} {...labelProps}>{children}</label></th>
            <td className='pb-5 text-center w-fit'><input id={name} name={name} className={inputClassName} {...inputProps}></input></td>
        </tr>
    );
}

function JoinRoom() {
    const { joinRoom } = useContext(SocketContext);
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

    return (
        <form className='w-5/6 lg:w-1/2 flex flex-col items-center justify-center gap-3 bg-secondary p-5 rounded' onSubmit={onJoin}>
            <table className='w-full'>
                <tbody className='font-semibold'>
                    <InputRow 
                        name='Name'
                        inputClassName='bg-white rounded text-input'
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
                            inputClassName='bg-white rounded text-input'
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
            <button type='submit'>Join Room</button>
        </form>
    );
}

export default JoinRoom;