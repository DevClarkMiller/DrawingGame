import { useContext, useState } from 'react'

// Lib
import randomSentence from '../../../lib/randomSentence';

// Components
import LabeledTextArea from '../../components/LabeledTextArea';

// Context
import { SocketContext } from '../../context/SocketProvider';

// Here the minigame start, where users will pick their sentence
function SketchAndVoteLand() {
    const {} = useContext(SocketContext);

    const [sentence, setSentence] = useState<string>(randomSentence());

    return (
        <form className='card card-gradient'>
            <div className='inner-card font-bold'>
                <label className='text-4xl mb-5'>Your Sentence 🥳</label>
                <textarea value={sentence} onChange={e => setSentence(e.target.value)} placeholder='Your sentence here' className='text-input w-2/3 text-center text-3xl'/>
            </div>
        </form>
    );
}

export default SketchAndVoteLand;