import { IoTrash, IoColorFill, IoArrowUndo, IoArrowRedo } from "react-icons/io5";

interface ToolBarProps{
    setStrokeStyle: (strokeStyle: string) => void;
    setLineWidth: (width: number) => void;
    setUsingFill: (usingFill: boolean) => void;

    maxLineWidth?: number;
    strokeStyle: string;
    lineWidth: number;

    deleteCanvas: () => void;
    undo: () => void;
    redo: () => void;
    clearCanvas: () => void;

    canUndo: boolean;
    canRedo: boolean;
    usingFill: boolean;
}

const CanvasToolBar = ({
    deleteCanvas, undo, redo, clearCanvas, canUndo, canRedo, lineWidth, setLineWidth, maxLineWidth = 8, strokeStyle, setStrokeStyle, usingFill, setUsingFill, ...props
}: ToolBarProps) =>{
    function onChangeWidth(e: React.ChangeEvent<HTMLInputElement>){ 
        const num = parseInt(e.target.value);
        if (num > 0 && num <= maxLineWidth)
            setLineWidth(num);
    }

    function onChangeColor(e: React.ChangeEvent<HTMLInputElement>){ setStrokeStyle(e.target.value); }

    function onClickFill(){ setUsingFill(!usingFill);}

    return(
        <div className="flex gap-5 justify-center px-12">
            <button onClick={deleteCanvas}><IoTrash /></button>
            <div className='drawOptions flex gap-5 items-center'>
                <input className='bg-white rounded h-full w-2/3 pl-1' min={1} max={maxLineWidth} value={lineWidth} onChange={onChangeWidth} type='number' />
                <input className='h-full' onChange={onChangeColor} type='color'/>
                <button onClick={onClickFill} style={{color: usingFill ? "green": "" }}><IoColorFill /></button>
            </div>
            <div className='undoRedo flex gap-5'>
                <button disabled= {!canUndo} onClick={undo}><IoArrowUndo /></button>
                <button disabled= {!canRedo} onClick={redo}><IoArrowRedo /></button>
            </div>
        </div>
    );
}

export default CanvasToolBar;