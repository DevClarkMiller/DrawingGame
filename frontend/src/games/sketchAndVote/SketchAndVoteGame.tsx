import React from 'react'

// Components
import StandardGame from '../StandardGame';
import DraggableImage from '@components/DraggableImage';

// Context
import { SocketContext } from '@context/SocketProvider';

function SketchAndVoteGame() {
    const { sketchVote, numRounds, currRound } = React.useContext(SocketContext);

    return (
        <>
            <DraggableImage src={sketchVote?.selectedImage}/>
            <StandardGame numRounds={numRounds} currRound={currRound}/>
        </>
    );
}

export default SketchAndVoteGame;