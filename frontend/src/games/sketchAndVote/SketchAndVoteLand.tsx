import { useContext, useState } from 'react'

// Lib
import randomSentence from '@lib/randomSentence';

// Components
import ImageOptions from './ImageOptions';

// Context
import { SocketContext } from '@context/SocketProvider';
import { AppContext } from '@src/App';

// Here the minigame start, where users will pick their sentence
function SketchAndVoteLand() {
    const { parseSentence } = useContext(SocketContext);
    const { logger } = useContext(AppContext);

    const [sentence, setSentence] = useState<string>(randomSentence());

    function onSubmitSentence(e: React.SyntheticEvent<HTMLFormElement>){
        e.preventDefault();
        logger.log(sentence);
        parseSentence(sentence);
    }

    return (
        <>
            <form onSubmit={onSubmitSentence} className='card card-gradient'>
                <div className='inner-card font-bold'>
                    
                    <label className='text-4xl mb-5'>Your Sentence 🥳</label>
                    <input value={sentence} onChange={e => setSentence(e.target.value)} placeholder='Your sentence here' className='text-input w-2/3 text-center text-3xl p-3'/>
                </div>
            </form>
            <ImageOptions />
        </>
    );
}

export default SketchAndVoteLand;