import { useEffect, useRef, useState, useCallback, useMemo, useReducer } from 'react';

// Types
import { PixelManager, Coord, Color } from '@def';

// Components
import CanvasToolBar from './CanvasToolBar';

// Reducers
import {ActionKind, INITIAL, reducer} from '@reducers/canvasReducer';

interface CanvasProps {
    height: number;
    width: number;
}

const Canvas = (props: CanvasProps) =>{
    // Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Maintain a stack of actions, when you undo something it goes onto redo and vice-versa
    const [undoStack, setUndoStack] = useState<string[]>([]);
    const [redoStack, setRedoStack] = useState<string[]>([]);

    // Reducers
    const [state, dispatch] = useReducer(reducer, INITIAL);

    // Memoized values
    const canUndo = useMemo(() => state?.currentImage !== null || undoStack?.length > 0, [undoStack, state?.currentImage]);
    const canRedo = useMemo(() => redoStack?.length > 0 ,[redoStack]);

    function setMousePos(mousePos: Coord | null) { dispatch({type: ActionKind.SET_MOUSE_POS, payload: mousePos}); }
    function setIsPainting(val: boolean) { dispatch({type: ActionKind.SET_PAINTING, payload: val}); }
    function setCurrentImage(image: string | null) { dispatch({type: ActionKind.SET_CURRENT_IMAGE, payload: image}); }

    // Drawing options
    function setLineWidth(lineWidth: number) { dispatch({type: ActionKind.SET_LINE_WIDTH, payload: lineWidth}); }
    function setUsingFill(usingFill: boolean) { dispatch({type: ActionKind.SET_USING_FILL, payload: usingFill}); }
    function setStrokeStyle(strokeStyle: string) { dispatch({type: ActionKind.SET_STROKE_STYLE, payload: strokeStyle}); }

    function addHistory(image: string) { dispatch({type: ActionKind.ADD_HISTORY, payload: image}); }

    // Delete the canvas and add it to the undo stack
    function deleteCanvas(){
        clearCanvas();
        setUndoStack([]);
        setRedoStack([]);
        dispatch({type: ActionKind.SET_CURRENT_IMAGE}); // Uses the default value of null
    }

    /**
     * Brief: Undoes a draw or action
     */
    function undo(){
        if (undoStack.length === 0 && !state?.currentImage) return;
        // Move current image onto the redo stack
        setRedoStack([...redoStack as [], String(state?.currentImage)]);
        
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
        if (state?.currentImage){
            setUndoStack([...undoStack as [], String(state?.currentImage)]);
        }
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
    function floodFill(targetColor: Color, newColor: Color, row: number, col: number, width: number, height: number, pixelManger: PixelManager){
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        const stk: Coord[] = [{y: row, x: col}];
        const visited = new Set<string>(`${col}, ${row}`);

        while (stk.length > 0){
            const point: Coord | undefined = stk.pop();
            if (!point) continue;
            visited.add(`${point?.x}, ${point.y}`);
            // Mark the start as the color
            pixelManger.setPixel(point.x, point.y, newColor);

            // Check if the current pixel isn't the same color
            for (const dir of dirs){
                const y = point.y + dir[0];
                const x = point.x + dir[1];
                
                if (y < 0 || y > height -1) continue;
                if (x < 0 || x > width - 1) continue;
                if (visited.has(`${x}, ${y}`)) continue;

                // Push onto stack if the pixel isn't the target
                const pixel = pixelManger.getPixel(x, y);
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
        const context = canvas.getContext('2d', { willReadFrequently: true });

        if (context) {
            const imageData: ImageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const pixelManger = new PixelManager(imageData.data, imageData.width);

            const targetColor = pixelManger.getPixel(mousePos.x, mousePos.y);
            const newColor = hexToRgba(state?.strokeStyle);
            floodFill(targetColor, newColor, mousePos.y, mousePos.x, imageData.width, imageData.height, pixelManger);
            context.putImageData(imageData, 0, 0);
            dispatch({type: ActionKind.SET_PAINTING, payload: true});
            exitPaint(); // To save this as the current image
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
            context.strokeStyle = state?.strokeStyle;
            context.lineJoin = "round";
            context.lineWidth = state?.lineWidth;

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
            if (state?.usingFill)
                fillCanvas(mousePos);
            setMousePos(mousePos);
        }                
    }, [state?.usingFill, state?.mousePos]);

    const paint = useCallback(
        (event: MouseEvent) => {
            if (state.isPainting) {
                const newMousePos = getCoords(event);
                if (state?.mousePos && newMousePos) {
                    if (!state?.usingFill)
                        drawLine(state?.mousePos, newMousePos);
                    setMousePos(newMousePos);
                }
            }
        },
        [state?.isPainting, state?.mousePos]
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
        if (!state.isPainting) return;
        setIsPainting(false);
        setMousePos(null);

        if (!canvasRef.current) return;
        const canvas: HTMLCanvasElement = canvasRef.current;
        
        // Add the last current canvas onto the undo stack
        const lastImage = state?.currentImage;
        if (lastImage) // Add the current image onto the undostack if it exists
            setUndoStack([...undoStack, lastImage]);
        
        const imgUrl: string = canvas.toDataURL("image/png");
        setCurrentImage(imgUrl); // Make the current image the current canvas

        // Clear out the redo stack
        setRedoStack([]);
    }, [canvasRef, state?.isPainting]);

    // Any time the current image is updated, add to history
    useEffect(() => {
        if (state?.currentImage){
            addHistory(state.currentImage);
        }
    }, [state?.currentImage]);

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
            <CanvasToolBar 
                usingFill={state?.usingFill}
                setUsingFill={setUsingFill}
                lineWidth={state?.lineWidth}
                strokeStyle={state?.strokeStyle}
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