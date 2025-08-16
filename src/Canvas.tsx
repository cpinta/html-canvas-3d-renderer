import React, { KeyboardEvent, useEffect, useRef, useState } from 'react';
import {MMath} from './Matrix';
import { Renderer } from './Renderer';

interface CanvasProps {}

const Canvas = (props : CanvasProps) => {

    const canvasRef = useRef(null);
    const renderer = useRef(new Renderer())

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

    useEffect(() => {

        if(!canvasRef.current){ return; }

        const canvas: HTMLCanvasElement = canvasRef.current
        const context: CanvasRenderingContext2D | null = canvas.getContext('2d')
        
        if(!context){ return; }

        let frameCount = 0
        let animationFrameId : number
        let deltaTime = Date.now() - prevTime.current;
        timeSinceStart.current += deltaTime;

        let displayScale = 4
        canvas.width = 512 * displayScale
        canvas.height = 288 * displayScale

        context.imageSmoothingEnabled = false;
        context.lineWidth = 1
        context.strokeStyle = '#FF0000'


        //Our draw came here
        const render = () => {
            frameCount++
            if(true){
                context.clearRect(0, 0, context.canvas.width, context.canvas.height)
                context.fillStyle = '#000000'
                context.fillRect(0, 0, context.canvas.width, context.canvas.height)

                renderer.current.draw(context, displayScale, deltaTime)
            }
            animationFrameId = window.requestAnimationFrame(render)
        }
        render()

        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
    }, [])


    window.addEventListener("keydown", e => handleKeyDown(e as any));
    window.addEventListener("keyup", e => handleKeyUp(e as any));
    // window.addEventListener("keyup", e => handleKeyUp(e));
    
    function handleKeyDown(e: KeyboardEvent) {
        console.log('key down', e.code)
    }
    function handleKeyUp(e: KeyboardEvent) {
        console.log('key up', e.code)
    }




    return(
        <canvas ref={canvasRef} {...props} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} style={{width:100+`%`, height:100+`%`}} />
    );
}

export default Canvas;