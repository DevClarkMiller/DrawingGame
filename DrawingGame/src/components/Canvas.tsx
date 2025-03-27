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
    setStrokeStyle: Dispatch<string>;
    setLineWidth: React.Dispatch<React.SetStateAction<number>>;
    setUsingFill: Dispatch<React.SetStateAction<boolean>>;

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

interface Color{
    r: number;
    g: number;
    b: number;
    a: number;
}

const Canvas = (props: CanvasProps) =>{
    // Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // State
    const [isPainting, setIsPainting] = useState<boolean>(false);
    const [mousePos, setMousePos] = useState<Coord | null>(null);

    const [currentImage, setCurrentImage] = useState<string | null>(null);

    const [canvasController, setCanvasController] = useState<CanvasController>(new CanvasController(canvasRef));

    // Drawing options
    const [usingFill, setUsingFill] = useState<boolean>(false);
    const [strokeStyle, setStrokeStyle] = useState<string>('#000000');
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

    const getIndex = (x:number, y: number, width: number): number => {
        return (y * width + x) * 4;
    }; 
   
    const getPixel = (x:number, y:number, width: number, data: Uint8ClampedArray<ArrayBufferLike>): Color => {
        const i: number = getIndex(x, y, width);
        return { r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] };
    };

    const setPixel = (x: number, y: number, color: Color, width: number, data: Uint8ClampedArray<ArrayBufferLike>) =>{
        const i = getIndex(x, y, width);
        data[i] = color.r;
        data[i + 1] = color.g;
        data[i + 2] = color.b;
        data[i + 3] = color.a;
    }

    const colorsMatch = (a: Color, b: Color) => {
        return a.r === b.r && a.g === b.g && a.b === b.b;
    }

    function hexToRgba(hex: string, alpha: number = 255): Color{
        // Remove the '#' if present
        hex = hex.replace(/^#/, "");
    
        // Parse the color
        let r: number, g: number, b: number;
    
        if (hex.length === 3) {
            // Convert shorthand hex (#fff → #ffffff)
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else {
            throw new Error("Invalid hex color format");
        }
    
        return { r, g, b, a: alpha };
    }

    /**
     * Brief: My own flood-fill algorithm
     */
    function floodFill(targetColor: Color, newColor: Color, row: number, col: number, width: number, height: number, data: Uint8ClampedArray<ArrayBufferLike>){
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        const stk: Coord[] = [{y: row, x: col}];
        const visited = new Set<string>(`${col}, ${row}`);

        while (stk.length > 0){
            const point: Coord | undefined = stk.pop();
            if (!point) continue;
            visited.add(`${point?.x}, ${point.y}`);
            // Mark the start as the color
            setPixel(point.x, point.y, newColor, width, data);

            // Check if the current pixel isn't the same color
            for (const dir of dirs){
                const y = point.y + dir[0];
                const x = point.x + dir[1];
                
                if (y < 0 || y > height -1) continue;
                if (x < 0 || x > width - 1) continue;
                if (visited.has(`${x}, ${y}`)) continue;

                // Push onto stack if the pixel isn't the target
                const pixel = getPixel(x, y, width, data);
                if (colorsMatch(targetColor, pixel))
                    stk.push({x: x, y: y});
            }
        }
    }

    /**
     * Brief: Sets everything up for the floodfill algorithm to take place
     * 
     */
    const fillCanvas = (mousePos: Coord) =>{
        if (!canvasRef.current) return;
        const canvas: HTMLCanvasElement = canvasRef.current;
        const context = canvas.getContext('2d');

        if (context) {
            const imageData: ImageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const data: Uint8ClampedArray<ArrayBufferLike> = imageData.data;
            const targetColor = getPixel(mousePos.x, mousePos.y, imageData.width, data);
            const newColor = hexToRgba(strokeStyle);
            floodFill(targetColor, newColor, mousePos.y, mousePos.x, imageData.width, imageData.height, data);
            context.putImageData(imageData, 0, 0);
        }
    }

    const clearCanvas = () =>{
        if (!canvasRef.current) return;
        const canvas: HTMLCanvasElement = canvasRef.current;
        const context = canvas.getContext('2d');
        if (context){
            context.fillStyle = "white"; // Sets it to white, but doesn't change the value in state
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
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

    const bucket = useCallback((event: MouseEvent) => {
        const mousePos: Coord | undefined = getCoords(event);
        if (mousePos){
            if (usingFill)
                fillCanvas(mousePos);
            setMousePos(mousePos);
        }                
    }, [usingFill, mousePos]);

    const paint = useCallback(
        (event: MouseEvent) => {
            if (isPainting) {
                const newMousePos = getCoords(event);
                if (mousePos && newMousePos) {
                    if (!usingFill)
                        drawLine(mousePos, newMousePos);
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
        canvas.addEventListener('click', bucket);
        return () => {
            canvas.removeEventListener('mousedown', startPaint);
        };
    }, [startPaint]);

    useEffect(() =>{
        if (!canvasRef.current) return;

        const canvas: HTMLCanvasElement = canvasRef.current;
        canvas.addEventListener('click', bucket);

        return () => {
            canvas.removeEventListener('click', bucket);
        };
    }, [bucket]);

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

    useEffect(() => clearCanvas(), []);

    return (
        <div className='w-1/2 flex flex-col items-center gap-3'>
            <canvas width={props.width} height={props.height} ref={canvasRef}/>
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