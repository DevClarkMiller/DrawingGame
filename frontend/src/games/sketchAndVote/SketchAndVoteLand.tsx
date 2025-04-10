import { useContext, useEffect, useState } from 'react'

// Lib
import randomSentence from '@lib/randomSentence';

// Components
import ImageOptions from './ImageOptions';
import Timer from '@components/Timer';
import DraggableImage from '@components/DraggableImage';

// Context
import { SocketContext } from '@context/SocketProvider';
import useColorRatio from '@hooks/useColorRatio';

// Here the minigame start, where users will pick their sentence
function SketchAndVoteLand() {
    const { parseSentence, sketchVote, players } = useContext(SocketContext);

    const [show, setShow] = useState<boolean>(false);
    
    const readyColor = useColorRatio(sketchVote?.playersReady, players?.length);

    useEffect(() =>{
        if (!sketchVote?.selectedImage && sketchVote.imageOptions?.length > 0){
            setShow(true);
        }else
            setShow(false);
    }, [sketchVote?.selectedImage]);

    const [sentence, setSentence] = useState<string>(randomSentence());

    function onSubmitSentence(e: React.SyntheticEvent<HTMLFormElement>){
        e.preventDefault();
        parseSentence(sentence);
        setShow(true);
    }

    return (
        <>
            <form onSubmit={onSubmitSentence} className='card card-gradient'>
                <div className='inner-card font-bold'>
                    {sketchVote && <Timer timeLeft={sketchVote.pickTime} maxTime={45} />}
                    <div className={`text-3xl mb-4 ${readyColor}`}>{sketchVote?.playersReady} / {players.length} players ready</div>
                    <label className='text-4xl mb-5'>Your Sentence 🥳</label>
                    <input value={sentence} onChange={e => setSentence(e.target.value)} placeholder='Your sentence here' className='text-input w-2/3 text-center text-3xl p-3'/>
                    
                    {sketchVote?.selectedImage && <DraggableImage src={sketchVote?.selectedImage}/>}
                </div>
            </form>
            <ImageOptions show={show} setShow={setShow}/>
        </>
    );
}

export default SketchAndVoteLand;