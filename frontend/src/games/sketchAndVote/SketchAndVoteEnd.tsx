import { useContext } from 'react';

// Types
import { Logger } from '@lib/logger';

// Custom hooks
import { useLogger } from '@hooks/useLogger';

// Context
import { SocketContext } from '@context/SocketProvider';

function SketchAndVoteEnd() {
    const { currentPlayer, nextImage } = useContext(SocketContext);
    const logger: Logger = useLogger();

    return (
        <div className='flex flex-col item-center'>
            <ul>

            </ul>
            {!currentPlayer?.isHost && <button onClick={nextImage}>Next Image</button>}
        </div>
    );
}

export default SketchAndVoteEnd;