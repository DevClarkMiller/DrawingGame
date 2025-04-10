import React from 'react'

// Components
import StandardGame from '../StandardGame';
import DraggableImage from '@components/DraggableImage';

// Context
import { SocketContext } from '@context/SocketProvider';

function SketchAndVoteGame() {
    const { sketchVote } = React.useContext(SocketContext);

    return (
        <>
            <DraggableImage src={sketchVote?.selectedImage}/>
            <StandardGame />
        </>
    );
}

export default SketchAndVoteGame;