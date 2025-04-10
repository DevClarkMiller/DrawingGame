import React, { useRef, useState } from 'react'

// Components
import Draggable from 'react-draggable';
import {Resizable} from 'react-resizable';

// Icons
import { VscChromeMinimize } from "react-icons/vsc";

function DraggableImage() {
    const nodeRef = useRef<HTMLDivElement>(null);

    // State
    const [minimized, setMinimized] = useState<boolean>(false);
    const [dimensions, setDimensions] = useState({width: 300, height: 200});

    const handleResize = (_: any, { size }: any) => {
        setDimensions(size);
    };

    return (
        <Draggable 
            nodeRef={nodeRef as React.RefObject<HTMLElement>}
            bounds="body"
            handle=".imageHeader"
        >
            <div className='hover:cursor-move z-50 border-gray-500 border-2 rounded overflow-clip' ref={nodeRef}>
                <Resizable
                    width={dimensions.width}
                    height={dimensions.height}
                    onResize={handleResize}
                    minConstraints={[200, 100]}
                    maxConstraints={[800, 600]}
                >
                    <div 
                        style={!minimized ? {width: dimensions.width, height: dimensions.height} : {}}
                    >
                        <div className='imageHeader bg-gray-500 flex justify-end w-full text-white'>
                            <button onClick={() => setMinimized(!minimized)} className='hover:text-blue-500 clean-btn'>
                                <VscChromeMinimize className='text-2xl nice-trans'/>
                            </button>
                        </div>
                        {!minimized ?
                            (<div className='size-full'>
                                <img 
                                    src='https://www.exitlag.com/blog/wp-content/uploads/2024/12/Who-Is-Steve-in-Minecraft_-The-Story-Behind-the-Iconic-Character.webp'
                                    className='size-full object-fill select-none pointer-events-none'
                                    draggable='false'
                                />
                            </div>)
                            : (<div className='p-2'>Image</div>)
                        }
                    </div>
                </Resizable>
            </div>
        </Draggable>
    );
}

export default DraggableImage;