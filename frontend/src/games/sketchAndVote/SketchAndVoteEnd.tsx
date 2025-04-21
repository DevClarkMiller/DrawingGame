import { useContext, useEffect } from 'react';

// Context
import { SocketContext } from '@context/SocketProvider';

// Note that the sketch will display the final image, then when a player hovers on it, it will show the whole process of drawing it frame by frame
function PlayerImage({name, sketch}: {name: string, sketch: string[]}){
    return(
        <div className='flex flex-col'>
            <div className='playerName font-bold text-lg px-1 w-full bg-secondary'>{name}</div>
            <img src={sketch[sketch.length - 1]}/> 
        </div>
    );
}

function PlayerImages({sketches}: {sketches?: Array<any>}){
    return(
        <ul className='w-full flex flex-col items-center p-3'>{
            sketches?.map((item) => <li key={item[0]}>{<PlayerImage name={item[0]} sketch={item[1]} />}</li>)
        }</ul>
    );
}

function ImageBox({img, currImage}: {img: string, currImage?: string}){
    return(
        <div className={`w-28 lg:w-32 aspect-square ${currImage === img ? "shadow-yellow-600 shadow-md" : ""}`}>
            <img className='size-full' src={img}/>
        </div>
    );
}

function Images({imgs, currImage}: {imgs: string[], currImage?: string}){
    return(
        <ul className='flex flex-col items-start size-full gap-5'>{imgs.map((img) => <li key={img}><ImageBox img={img} currImage={currImage}/></li>)}</ul>
    );
}

function SketchAndVoteEnd() {
    const { currentPlayer, nextImage, sketchVote } = useContext(SocketContext);

    return (
        <div className='lg:w-2/3 flex flex-col item-center size-full flex-grow gap-3 card card-gradient'>
            <div className='size-full grid grid-cols-3 gap-5 pl-8 inner-card'>
                <div className='size-full col-span-1'><Images imgs={sketchVote.finalSketchOrder} currImage={sketchVote.finalSketch?.image} /></div>
                <div className='size-full col-span-2 overflow-y-scroll border-light border-2 rounded-lg'>
                    {sketchVote.finalSketch ? <PlayerImages sketches={sketchVote.finalSketch.sketches} /> : currentPlayer?.isHost ? 
                    <button onClick={nextImage}>Next Image</button> : <div className='size-full flex items-center'>Waiting for host...</div>} 
                </div>
            </div>
            {sketchVote.finalSketch && currentPlayer?.isHost && <button onClick={nextImage}>Next Image</button>}
        </div>
    );
}

export default SketchAndVoteEnd;