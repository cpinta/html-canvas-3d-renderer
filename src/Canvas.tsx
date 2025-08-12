import React, { useEffect, useRef } from 'react';

interface CanvasProps {}

const Canvas = (props : CanvasProps) => {

    const canvasRef = useRef(null);

    const prevTime = useRef<number>(Date.now());
    const timeSinceStart = useRef<number>(0);

    const randomColor = () => {
        let colors = 'ABCDEF0123456789'
        let result = '#'
        for(let i=0; i<6; i++){
            result += colors[Math.floor(Math.random()*colors.length)]
        }
        return result
    }

    const draw = (ctx: CanvasRenderingContext2D, frameCount : number, resolutionX : number, resolutionY : number, deltaTime : number) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        ctx.fillStyle = '#000000'
        for(let i=0; i<resolutionX; i++) {
            for(let j=0; j<resolutionY; j++) {
                ctx.fillStyle = randomColor()
                ctx.rect(i * ctx.canvas.width / resolutionX, j * ctx.canvas.height / resolutionY, ctx.canvas.width / resolutionX, ctx.canvas.height / resolutionY)
                ctx.fill()
            }
        }
    }


    useEffect(() => {

        if(!canvasRef.current){ return; }

        const canvas: HTMLCanvasElement = canvasRef.current
        const context: CanvasRenderingContext2D | null = canvas.getContext('2d')
        
        if(!context){ return; }

        let frameCount = 0
        let resolutionX = 2
        let resolutionY = 2
        let animationFrameId : number
        let deltaTime = Date.now() - prevTime.current;
        timeSinceStart.current += deltaTime;

        //Our draw came here
        const render = () => {
            frameCount++
            if(frameCount % 100 == 0){
                draw(context, frameCount, resolutionX, resolutionY, deltaTime)
            }
            animationFrameId = window.requestAnimationFrame(render)
        }
        render()

        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
    }, [draw])


    return(
        <canvas ref={canvasRef} {...props} style={{width:100+`%`, height:100+`%`}} />
    );
}

export default Canvas;