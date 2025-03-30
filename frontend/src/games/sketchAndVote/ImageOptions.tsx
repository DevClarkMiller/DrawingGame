import { useContext } from "react";

import ListModal from "@src/modals/ListModal";
import GenericModal from "@src/modals/GenericModal";

// Namespaces
import SketchAndVote from "@reducers/sketchVoteReducer";


// Context
import { SocketContext } from "@context/SocketProvider";


function ImageOption({src, onImageClick}: {src: string, onImageClick: (src: string) => void}){
    return(
        <li className="size-full overflow-hidden max-w-full h-auto min-h-60">
            <button onClick={() => onImageClick(src)} type="button" className="size-full !bg-transparent overflow-hidden flex justify-center">
                <img className="max-w-full h-full" src={src}/>
            </button>
        </li>
    );
}

function CustomBody({children}: {children: React.ReactNode}): React.JSX.Element{
    return (
        <ul className="overflow-y-scroll size-full grid grid-cols-2">{children}</ul>
    );
}

function ImageOptions(
    {show, setShow}: {show: boolean, setShow: React.Dispatch<React.SetStateAction<boolean>>}
) {
    const { sketchVote, dispatchSketchVote } = useContext(SocketContext);

    function onImageClick(src: string){
        console.log(src);
        dispatchSketchVote({type: SketchAndVote.ActionKind.SET_SELECTED_IMAGE, payload: src});
    }

    return (
        <GenericModal 
            title="Image Options"
            onClose={null}
            onSubmit={null}
            show={show} 
            setShow={setShow}
            hideFooter
            hideExit
            centerTitle
            useMaxWidth
            CustomBody={CustomBody}>
            {sketchVote?.imageOptions?.map((imgOpt) => <ImageOption key={imgOpt} onImageClick={onImageClick} src={imgOpt}/>)}
        </GenericModal>
    );
}

export default ImageOptions;