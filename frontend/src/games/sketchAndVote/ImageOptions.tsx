import { useContext } from "react";

import ListModal from "@src/modals/ListModal";
import GenericModal from "@src/modals/GenericModal";
import { useState } from "react";

// Context
import { SocketContext } from "@context/SocketProvider";


function ImageOption({src}: {src: string}){
    return(
        <li>
            <button type="button" className="size-full !bg-transparent">
                <img src={src}/>
            </button>
        </li>
    );
}

function ImageOptions() {
    const [show, setShow] = useState<boolean>(true);
    const { sketchVote } = useContext(SocketContext);

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
            >
            {sketchVote?.imageOptions?.map((imgOpt) => <ImageOption key={imgOpt} src={imgOpt}/>)}
        </GenericModal>
    );
}

export default ImageOptions;