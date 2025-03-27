import React, { useContext, InputHTMLAttributes, LabelHTMLAttributes, useMemo, useState } from 'react'

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


function CreateRoom() {
    // Context
    const { createRoom } = useContext(SocketContext);

    // State
    const [hostName, setHostName] = useState<string>(randomName());


    function onCreate(e: React.SyntheticEvent<HTMLFormElement>){
        e.preventDefault();
        createRoom(hostName);
    }

    return (
        <form className='w-5/6 lg:w-1/2 flex flex-col items-center justify-center gap-3 bg-secondary p-5 rounded' onSubmit={onCreate}>
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
        </form>
    );
}

export default CreateRoom;