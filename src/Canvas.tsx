import { useEffect, useRef } from 'react';
import { Renderer, RendererProps } from './Renderer';
import FileImport3D from './FileImport3D';
import { InputManager } from './InputManager';
import { Vector3 } from './3D';
import { Color, Vector2 } from './2D';

interface CanvasProps {}

const Canvas = (props : CanvasProps) => {

    const canvasRef = useRef(null);
    const fileRef = useRef(null);
    const rendererProps = useRef({} as RendererProps)
    const renderer = useRef(new Renderer())
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

        rendererProps.current = {ctx:context, deltaTime: 0, frameCount: frameCount}


        let moveVelocity = 10
        let mouseSensitivity = 0.0025

        let camRotationSpeed: Vector2 = new Vector2(0.1, 0.1) 
        let objectRotationSpeed: Vector2 = new Vector2(1, 0.1) 


        renderer.current.setup(context, displayScale).then(() =>{
            const render = () => {
                frameCount++
                if(true){
                    let deltaTime: number = (Date.now() - prevTime.current)/1000;
                    rendererProps.current.deltaTime = deltaTime
                    prevTime.current = Date.now()
                    timeSinceStart.current += deltaTime;

                    clearCanvas(context)
                    // let mouseVec: Vector2 = input.current.getMouseVector()
                    let mouseVec: Vector2 = input.current.mouseVector
                    // mouseVec.x *= mouseSensitivity
                    // mouseVec.y *= mouseSensitivity


                    renderer.current.camera.resetRotation()
                    renderer.current.camera.camRotate(new Vector2((mouseVec.x/window.innerWidth-0.5)*camRotationSpeed.x, (mouseVec.y/window.innerHeight-0.5)*camRotationSpeed.y))
                    renderer.current.objects[0].resetRotation()
                    renderer.current.objects[0].wRotate(new Vector3((mouseVec.y/window.innerHeight-0.5)*objectRotationSpeed.y, (mouseVec.x/window.innerWidth-0.5)*objectRotationSpeed.x,0))

                    // renderer.current.camera.wMovePosition(new Vector3(input.current.moveVector.x, input.current.moveVector.z, input.current.moveVector.y).multiply(deltaTime * moveVelocity))
                    renderer.current.draw(rendererProps.current)

                    if(frameCount % updateFPSevery == 0){
                        fps.current = Math.trunc(1/deltaTime)
                    }

                    context.fillText(fps.current.toString(), 20, 100)
                    context.fillText(mouseVec.x.toString()+", "+mouseVec.y.toString(), 20, 200)
                    context.fillText(window.innerWidth.toString()+", "+window.innerHeight.toString(), 20, 220)
                    context.fillText((Math.trunc((mouseVec.x/window.innerWidth-0.5)*100)/100).toString()+", "+(Math.trunc((mouseVec.y/window.innerHeight-0.5)*100)/100).toString(), 20, 240)
                }
                animationFrameId = window.requestAnimationFrame(() => {
                    render();
                })
            };
            render();
            
        });
        

        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
    }, [])

    function clearCanvas(ctx: CanvasRenderingContext2D){
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        ctx.fillStyle = Color.background.toHex()
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.addEventListener(InputManager.strELockMouse, (e) =>{
            if(!canvasRef.current){ return; }

            const canvas: HTMLCanvasElement = canvasRef.current
            const context: CanvasRenderingContext2D | null = canvas.getContext('2d')

            if(!context){ return; }

            canvas.requestPointerLock()

        });

        document.addEventListener(InputManager.strEOpenFilePicker, (e) =>{
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
            
            renderer.current.setObj(FileImport3D.OBJ_Import(content, Color.orangeJuiceOrange))
        }
    }

    return(
        <>
            <canvas ref={canvasRef} {...props} style={{width:100+`%`, height:'99dvh', imageRendering: 'pixelated'}} />
            <input ref={fileRef} type='file' onChange={openFilePicker} style={{display:'none'}} />
        </>
    );
}

export default Canvas;