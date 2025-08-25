import { useEffect, useRef } from 'react';
import { Renderer, RendererProps } from './Renderer';
import FileImport3D from './FileImport3D';
import { InputManager } from './InputManager';
import { Vector3 } from './3D';
import { Vector2 } from './2D';

interface CanvasProps {}

const Canvas = (props : CanvasProps) => {

    const canvasRef = useRef(null);
    const fileRef = useRef(null);
    const renderer = useRef(new Renderer())
    const rendererProps = useRef({} as RendererProps)
    const input = useRef(new InputManager())

    const prevTime = useRef<number>(Date.now());
    const timeSinceStart = useRef<number>(0);
    const fps = useRef<number>(0);


    const randomColor = () => {
        let colors = 'ABCDEF0123456789'
        let result = '#'
        for(let i=0; i<6; i++){
            result += colors[Math.floor(Math.random()*colors.length)]
        }
        return result
    }

    useEffect(() => {

        if(!canvasRef.current){ return; }

        const canvas: HTMLCanvasElement = canvasRef.current
        const context: CanvasRenderingContext2D | null = canvas.getContext('2d')
        
        if(!context){ return; }

        let frameCount = 0
        let animationFrameId : number
        let updateFPSevery: number = 20

        let displayScale = 2
        canvas.width = 512 * displayScale
        canvas.height = 288 * displayScale

        context.imageSmoothingEnabled = false;
        // context.imageSmoothingQuality = "high"
        context.lineWidth = 1
        context.strokeStyle = '#FF0000'

        rendererProps.current = {canvas:canvas, ctx: context, scaleMultiplier: displayScale, deltaTime: 0, frameCount: frameCount}


        let moveVelocity = 10
        let mouseSensitivity = 0.005


        //Our draw came here
        const render = () => {
            frameCount++
            if(true){
                let deltaTime: number = (Date.now() - prevTime.current)/1000;
                rendererProps.current.deltaTime = deltaTime
                prevTime.current = Date.now()
                timeSinceStart.current += deltaTime;

                clearCanvas(context)
                let mouseVec: Vector2 = input.current.getMouseVector()
                mouseVec.x *= mouseSensitivity
                mouseVec.y *= mouseSensitivity
                renderer.current.camera.lRotate(new Vector3(-mouseVec.y, 0, 0))
                renderer.current.camera.wRotate(new Vector3(0, mouseVec.x, 0))

                renderer.current.camera.wMovePosition(new Vector3(input.current.moveVector.x, 0, input.current.moveVector.y).multiply(deltaTime * moveVelocity))
                renderer.current.draw(rendererProps.current)

                if(frameCount % updateFPSevery == 0){
                    fps.current = Math.trunc(1/deltaTime)
                }

                context.fillText(fps.current.toString(), 20, 100)
            }
            animationFrameId = window.requestAnimationFrame(() => {
                render();
            })
        };
        render();

        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
    }, [])

    function clearCanvas(ctx: CanvasRenderingContext2D){
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.addEventListener('lockMouse', (e) =>{
            if(!canvasRef.current){ return; }

            const canvas: HTMLCanvasElement = canvasRef.current
            const context: CanvasRenderingContext2D | null = canvas.getContext('2d')

            if(!context){ return; }

            canvas.requestPointerLock()

        });

        document.addEventListener('openFilePicker', (e) =>{
            if(!fileRef.current){
                return
            }
            let file : HTMLInputElement = fileRef.current
            file.click()
        });
    });

    function openFilePicker(){
        if(!fileRef.current){return}
        let fileElement : HTMLInputElement = fileRef.current
        if(!fileElement.files){return}
        let file = fileElement.files[0]
        if(!file){return}

        let reader: FileReader = new FileReader()

        reader.onload = (e) => {
            readFile(file.name, reader.result)
        }

        reader.readAsText(file)
        // reader.readAsArrayBuffer(file)
    }

    function readFile(name: string, content: string | ArrayBuffer | null){
        
        console.log('file'+name)
        if(name.endsWith('.obj')){
            if(!content){
                return
            }
            if(typeof(content) != "string"){
                return
            }
            
            renderer.current.setObj(FileImport3D.OBJ_Import(content))
        }
    }

    return(
        <>
            <canvas ref={canvasRef} {...props} style={{width:100+`%`, height:'0%', imageRendering: 'pixelated'}} />
            <input ref={fileRef} type='file' onChange={openFilePicker} style={{display:'none'}} />
        </>
    );
}

export default Canvas;