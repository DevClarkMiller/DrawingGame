import React from "react";

interface GenericModalProps{
    children?: React.ReactNode;
    show: any;
    onSubmit: any;
    title: string;
    btnText?: string;
    maxHeight?: string;
    centerTitle?: boolean;
    titleColor?: string;
    hideScroll?: boolean;
    hideFooter?: boolean;
    hideExit?: boolean;
    useMaxWidth?: boolean;

    // Callbacks
    onClose: any;

    // State setters
    setShow: any;
}
const GenericModal = ({
    children,
    show, 
    setShow, 
    onSubmit, 
    title, 
    btnText = "Ok", 
    onClose, 
    maxHeight='max-h-72', 
    centerTitle = false,
    titleColor = 'text-light',
    hideScroll = false,
    hideFooter = false,
    hideExit = false,
    useMaxWidth = false,
}: GenericModalProps) => {
    // Hides modal
    function onModalClose(){
        if (setShow)
            setShow(false);
        if (onClose)
            onClose();
    }

    function submit(e: React.SyntheticEvent<HTMLFormElement>){
        e.preventDefault();

        if (onSubmit) onSubmit(e);
        if (setShow) setShow(false);
    }

    return (
        <div id="modal" className={`${show ? "block" : "hidden"} fixed z-40 inset-0 bg-transparent bg-opacity-60 overflow-y-auto size-full px-4 modal flex items-center justify-center`}>
            <form onSubmit={submit} className={`relative flex flex-col shadow-xl rounded-md bg-primary mx-12 ${useMaxWidth ? "" : "max-w-md"} w-full h-1/2`}>
                {/* <!-- Modal header --> */}
                <div className="size flex justify-between items-center bg-regular text-white text-xl rounded-t-md px-4 py-2">
                    <h3 className={`font-semibold w-full ${titleColor} ${centerTitle && "text-center"} overflow-hidden overflow-ellipsis whitespace-nowrap`}>{title}</h3>
                    {!hideExit && <button type="button" onClick={onModalClose}>x</button>}
                </div>

                {/* <!-- Modal body --> */}
                <ul className={`${maxHeight} ${!hideScroll ? "overflow-y-scroll" : "overflow-clip" } p-4 gap-3 col-flex-center`}>
                    {children}
                </ul>

                {/* <!-- Modal footer --> */}
                {!hideFooter && <div className={`px-4 py-2 flex justify-center items-center space-x-4 ${children ? "border-t border-t-gray-500" : ""}`}>
                    <button className="bg-secondary !font-bold px-4 py-2 rounded-md hover:bg-blue-700 transition" type="submit">{btnText}</button>
                </div>}
            </form>
        </div>
    );
}

export default GenericModal