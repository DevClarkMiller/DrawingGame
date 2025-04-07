import React, { useRef, useState } from 'react'

// Components
import Draggable from 'react-draggable';
import { Resizable } from 're-resizable';

// Icons
import { VscChromeMinimize } from "react-icons/vsc";

function DraggableImage() {
    const nodeRef = useRef<HTMLDivElement>(null);

    // State
    const [minimized, setMinimized] = useState<boolean>(false);

    return (
        <Draggable 
            nodeRef={nodeRef as React.RefObject<HTMLElement>}
            bounds="body"
        >
            <div className='hover:cursor-pointer z-50 border-gray-500 border-2 rounded' ref={nodeRef}>
                <Resizable
                >
                    <div className='imageHeader bg-gray-500 flex justify-end w-full text-white'>
                        <button onClick={() => setMinimized(!minimized)} className='hover:text-blue-500 clean-btn'>
                            <VscChromeMinimize className='text-2xl nice-trans'/>
                        </button>
                    </div>
                    {!minimized ?
                        <>
                            <div className=''>
                                <img src='https://www.exitlag.com/blog/wp-content/uploads/2024/12/Who-Is-Steve-in-Minecraft_-The-Story-Behind-the-Iconic-Character.webp'/>
                            </div>
                        </> : <div className='p-2'>Image</div>
                    }
                </Resizable>
            </div>
        </Draggable>
    );
}

export default DraggableImage;