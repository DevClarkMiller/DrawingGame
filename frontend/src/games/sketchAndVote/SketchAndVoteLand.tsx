import { useContext, useEffect, useState } from 'react'

// Lib
import randomSentence from '@lib/randomSentence';

// Components
import ImageOptions from './ImageOptions';

// Context
import { SocketContext } from '@context/SocketProvider';
import { AppContext } from '@src/App';
import useColorRatio from '@hooks/useColorRatio';

// Here the minigame start, where users will pick their sentence
function SketchAndVoteLand() {
    const { parseSentence, sketchVote, players } = useContext(SocketContext);
    const { logger } = useContext(AppContext);

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
                    <div className={`text-3xl mb-4 ${readyColor}`}>{sketchVote?.playersReady} / {players.length} players ready</div>
                    <label className='text-4xl mb-5'>Your Sentence 🥳</label>
                    <input value={sentence} onChange={e => setSentence(e.target.value)} placeholder='Your sentence here' className='text-input w-2/3 text-center text-3xl p-3'/>
                    
                    {sketchVote?.selectedImage &&
                        <div className='w-2/3 lg:w-1/3 h-auto mt-5 flex justify-center items-center'>
                            <img src={sketchVote?.selectedImage}/>
                        </div>
                    }
                </div>
            </form>
            <ImageOptions show={show} setShow={setShow}/>
        </>
    );
}

export default SketchAndVoteLand;