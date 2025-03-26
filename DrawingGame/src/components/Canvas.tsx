import  React, { useEffect, useRef, useState, useCallback, useMemo, Dispatch } from 'react';

// Icons
import { IoArrowUndo, IoArrowRedo, IoTrash, IoColorFill } from "react-icons/io5";

interface CanvasProps {
    height: number;
    width: number;
}

type Coord = {
    x: number;
    y: number;
}

interface ToolBarProps{
    setStrokeStyle: Dispatch<string | CanvasGradient | CanvasPattern>;
    setLineWidth: React.Dispatch<React.SetStateAction<number>>;
    setUsingFill: Dispatch<React.SetStateAction<boolean>>;

    maxLineWidth?: number;
    strokeStyle: string | CanvasGradient | CanvasPattern;
    lineWidth: number;

    deleteCanvas: () => void;
    undo: () => void;
    redo: () => void;
    clearCanvas: () => void;

    canUndo: boolean;
    canRedo: boolean;
    usingFill: boolean;
}

// TODO: MOVE ALL METHODS OVER HERE
class CanvasController{
    public canvasRef: React.RefObject<HTMLCanvasElement | null>;

    public constructor(canvasRef: React.RefObject<HTMLCanvasElement | null>){
        this.canvasRef = canvasRef;
    }
}

const ToolBar = ({
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

const Canvas = (props: CanvasProps) =>{
    // Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // State
    const [isPainting, setIsPainting] = useState<boolean>(false);
    const [mousePos, setMousePos] = useState<Coord | null>(null);

    const [currentImage, setCurrentImage] = useState<string | null>(null);

    const [canvasControll, setCanvasController] = useState<CanvasController>(new CanvasController(canvasRef));

    // Drawing options
    const [usingFill, setUsingFill] = useState<boolean>(false);
    const [strokeStyle, setStrokeStyle] = useState<string | CanvasGradient | CanvasPattern>('black');
    const [lineWidth, setLineWidth] = useState<number>(5);

    // Maintain a stack of actions, when you undo something it goes onto redo and vice-versa
    const [undoStack, setUndoStack] = useState<string[]>([]);
    const [redoStack, setRedoStack] = useState<string[]>([]);

    // Memoized values
    const canUndo = useMemo(() => currentImage !== null || undoStack?.length > 0, [undoStack, currentImage]);
    const canRedo = useMemo(() => redoStack?.length > 0 ,[redoStack]);

    // Delete the canvas and add it to the undo stack
    function deleteCanvas(){
        clearCanvas();
        setUndoStack([]);
        setRedoStack([]);
        setCurrentImage(null);
    }

    /**
     * Brief: Undoes a draw or action
     */
    function undo(){
        if (undoStack.length === 0 && !currentImage) return;
        // Move current image onto the redo stack
        setRedoStack([...redoStack as [], String(currentImage)]);
        
        clearCanvas(); // Clear canvas regardless, because if there's no prev items, you will just delete the current screen
        let currItem: string | null = null;

        // If there is items, the canvas needs to be cleared too
        if (undoStack.length > 0){
            // Now turn the last stack item into the current image
            let tempUndoStack = [...undoStack as []];
            currItem = String(tempUndoStack.pop());
            drawImage(currItem);
            setUndoStack(tempUndoStack); 
        }

        setCurrentImage(currItem);
    }

    /**
     * Brief: Redoes a draw or action
     */
    function redo(){
        // Move current image onto the undo stack
        if (currentImage)
            setUndoStack([...undoStack as [], String(currentImage)]);
        
        clearCanvas(); // Clear canvas regardless, because if there's no prev items, you will just delete the current screen
        let currItem: string | null = null;

        // If there is items, the canvas needs to be cleared too
        if (redoStack.length > 0){
            // Now turn the last stack item into the current image
            let tempRedoStack = [...redoStack as []];
            currItem = String(tempRedoStack.pop());
            setCurrentImage(currItem);
            drawImage(currItem);
            setRedoStack(tempRedoStack); 
        }
    }
 
    const getCoords = (e: MouseEvent): Coord | undefined =>{
        if (!canvasRef.current) return;

        const canvas: HTMLCanvasElement = canvasRef.current;
        return {x: e.pageX - canvas.offsetLeft, y: e.pageY - canvas.offsetTop};
    }

    const fillCanvas = () =>{
        if (!canvasRef.current) return;
        const canvas: HTMLCanvasElement = canvasRef.current;
        const context = canvas.getContext('2d');
        if (context) {
            context.fill();
        }
    }

    const clearCanvas = () =>{
        if (!canvasRef.current) return;
        const canvas: HTMLCanvasElement = canvasRef.current;
        const context = canvas.getContext('2d');
        if (context) context.clearRect(0, 0, canvas.width, canvas.height);
    }

    const drawImage = (imageUrl: string) =>{
        if (!canvasRef.current) return;
        const canvas: HTMLCanvasElement = canvasRef.current;
        const context = canvas.getContext('2d');
        if (context){
            const image = new Image();
            image.src = imageUrl;
            image.onload = () => {
                context.drawImage(image, 0, 0);  
            };
        }
    }

    const drawLine = (mousePos: Coord, newMousePos: Coord) => {
        if (!canvasRef.current) return;
        const canvas: HTMLCanvasElement = canvasRef.current;
        const context = canvas.getContext('2d');
        if (context){
            context.strokeStyle = strokeStyle
            context.lineJoin = "round";
            context.lineWidth = lineWidth;

            context.beginPath();
            context.moveTo(mousePos.x, mousePos.y);
            context.lineTo(newMousePos.x, newMousePos.y);
            context.closePath();

            context.stroke();
        }
    }

    const paint = useCallback(
        (event: MouseEvent) => {
            if (isPainting) {
                const newMousePos = getCoords(event);
                if (mousePos && newMousePos) {
                    if (!usingFill)
                        drawLine(mousePos, newMousePos);
                    else
                        fillCanvas();
                    setMousePos(newMousePos);
                }
            }
        },
        [isPainting, mousePos]
    );

    // Callback
    const startPaint = useCallback((e: MouseEvent) =>{
        const coords = getCoords(e);
        if (coords){
            setMousePos(coords);
            setIsPainting(true);
        }
    }, []);

    // Don't do anything if you're not painting in the first place
    const exitPaint = useCallback(() => {
        if (!isPainting) return;
        setIsPainting(false);
        setMousePos(null);

        if (!canvasRef.current) return;
        const canvas: HTMLCanvasElement = canvasRef.current;
        
        // Add the last current canvas onto the undo stack
        const lastImage = currentImage;
        if (lastImage) // Add the current image onto the undostack if it exists
            setUndoStack([...undoStack, lastImage]);
        
        const imgUrl: string = canvas.toDataURL("image/png");
        setCurrentImage(imgUrl); // Make the current image the current canvas

        // Clear out the redo stack
        setRedoStack([]);
    }, [canvasRef, isPainting]);

    useEffect(() =>{
        if (!canvasRef.current) return;

        const canvas: HTMLCanvasElement = canvasRef.current;
        canvas.addEventListener('mousedown', startPaint);
        return () => {
            canvas.removeEventListener('mousedown', startPaint);
        };
    }, [startPaint]);

    useEffect(() =>{
        if (!canvasRef.current) return;

        const canvas: HTMLCanvasElement = canvasRef.current;
        canvas.addEventListener('mouseup', exitPaint);
        canvas.addEventListener('mouseleave', exitPaint);
        return () => {
            canvas.removeEventListener('mouseup', exitPaint);
            canvas.removeEventListener('mouseleave', exitPaint);
        }
    }, [exitPaint]);

    useEffect(() =>{
        if (!canvasRef.current) return; 

        const canvas: HTMLCanvasElement = canvasRef.current;
        canvas.addEventListener('mousemove', paint);
        return () => {
            canvas.removeEventListener('mousemove', paint);
        };
    }, [paint]);

    useEffect(() =>{
        if (canvasRef.current){
            // console.log(window.getComputedStyle(canvasRef.current.style));
        }
    }, [canvasRef]);

    
    return (
        <div className='w-1/2 flex flex-col items-center gap-3'>
            <canvas className='bg-white' width={props.width} height={props.height} ref={canvasRef}/>
            <ToolBar 
                usingFill={usingFill}
                setUsingFill={setUsingFill}
                lineWidth={lineWidth}
                strokeStyle={strokeStyle}
                setStrokeStyle={setStrokeStyle} 
                setLineWidth={setLineWidth} 
                deleteCanvas={deleteCanvas} 
                redo={redo} 
                undo={undo} 
                clearCanvas={clearCanvas}
                canUndo={canUndo} 
                canRedo={canRedo} 
            />
        </div>
    );
}

Canvas.defaultProps = {
    width: window.innerWidth,
    height: window.innerHeight,
};

export default Canvas;