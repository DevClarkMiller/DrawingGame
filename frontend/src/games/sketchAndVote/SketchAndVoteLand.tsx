import React, { useContext } from 'react'

// Context
import { SocketContext } from '../../context/SocketProvider';

// Here the minigame start, where users will pick their sentence
function SketchAndVoteLand() {
    const {} = useContext(SocketContext);

    return (
        <div>
            SketchAndVoteLand
    </div>
    );
}

export default SketchAndVoteLand;