import React, { useEffect, useRef } from 'react';

interface CanvasProps {}

class Vector3 {
    x: number;
    y: number;
    z: number;

    constructor(x : number, y : number, z : number){
        this.x = x
        this.y = y
        this.z = z
    }

    translate(x:number, y:number, z:number){
        let matrix = structuredClone(identityMatrix)
        matrix[0][3] = x;
        matrix[1][3] = y;
        matrix[2][3] = z;
        let newVec = MatrixMath.multiply(matrix, [[x],[y],[z]]);
        if(newVec){
            this.x = newVec[0][0]
            this.y = newVec[1][0]
            this.z = newVec[2][0]
        }
    }

    toMatrix3(): number[][]{
        return [[this.x],[this.y],[this.z]]
    }
}

class Vector2 {
    x: number;
    y: number;

    constructor(x : number, y : number){
        this.x = x
        this.y = y
    }
}

class MatrixMath {

    static Rx(theta: number): number[][]{
        return [
            [1,0,0],
            [0, Math.cos(theta), -Math.sin(theta)],
            [0, Math.sin(theta), Math.cos(theta)]
        ]
    }
    static Ry(theta: number): number[][]{
        return [
            [Math.cos(theta),0,Math.sin(theta)],
            [0, 1, 0],
            [-Math.sin(theta), 0, Math.cos(theta)]

        ]
    }
    static Rz(theta: number): number[][]{
        return [
            [Math.cos(theta),-Math.sin(theta),0],
            [Math.sin(theta), Math.cos(theta),0],
            [0, 0, 1]
        ]
    }



    static multiply(mat1: number[][], mat2: number[][]){
        if(mat1[0].length != mat2.length){
            if(mat2[0].length != mat1.length){
                return []
            }
        }


        let newMat: number[][] = []
        for(let i=0;i<mat1.length;i++){
            newMat[i] = []
        }

        let i=0;
        let j=0;
        let iterate = 0;
        while(i < mat1.length){
            if(iterate < mat1.length){
                let add = mat1[i][iterate] * mat2[iterate][j]  
                if(newMat[i][j]){
                    newMat[i][j] += add
                }
                else{
                    newMat[i][j] = add
                }
                iterate++
            }
            else{
                j++
                if(j > mat1[0].length-1 || j > mat2[0].length-1){
                    j = 0
                    i++
                }
                iterate = 0
            }
        }
        return newMat
    }

    static toVector3(matrix: number[][]){
        return new Vector3(matrix[0][0], matrix[1][0], matrix[2][0])
    }
}

const identityMatrix3 : number[][] = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
]

const identityMatrix : number[][] = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
]

class Mesh {
    rawVerts: Vector3[]
    objectMatrix: number[][] = structuredClone(identityMatrix3)
    worldMatrix: number[][] = structuredClone(identityMatrix3)

    constructor(verts : Vector3[]){
        this.rawVerts = verts
    }
    
    getWorldVerts(): Vector3[]{
       let worldVerts: Vector3[] = []
        for(let i = 0; i < this.rawVerts.length; i++){
            worldVerts[i] = MatrixMath.toVector3(MatrixMath.multiply(this.worldMatrix, this.rawVerts[i].toMatrix3()))
        }
       return worldVerts
    }

}


class Cube extends Mesh {

    constructor(origin: Vector3, size: number){
        let verts: Vector3[] = []
        let halfSize: number = size/2
        verts.push(new Vector3(origin.x + halfSize, origin.y + halfSize, origin.z + halfSize))
        verts.push(new Vector3(origin.x - halfSize, origin.y + halfSize, origin.z + halfSize))
        verts.push(new Vector3(origin.x - halfSize, origin.y - halfSize, origin.z + halfSize))
        verts.push(new Vector3(origin.x - halfSize, origin.y + halfSize, origin.z - halfSize))

        verts.push(new Vector3(origin.x + halfSize, origin.y - halfSize, origin.z + halfSize))
        verts.push(new Vector3(origin.x + halfSize, origin.y - halfSize, origin.z - halfSize))
        verts.push(new Vector3(origin.x + halfSize, origin.y + halfSize, origin.z - halfSize))
        verts.push(new Vector3(origin.x - halfSize, origin.y - halfSize, origin.z - halfSize))
        
        super(verts);
    }
}

function test(ctx: CanvasRenderingContext2D, meshes: Mesh[], camLoc: Vector3){
    let viewPlane = 90

    for(let j=0;j<meshes.length;j++){
        let verts = meshes[j].getWorldVerts()
        for(let i=0;i<verts.length;i++){

            verts[i] = MatrixMath.toVector3(MatrixMath.multiply(identityMatrix3, verts[i].toMatrix3()))
            
            let xdiff = verts[i].x - camLoc.x
            let ydiff = verts[i].y - camLoc.y
            let zdiff = verts[i].z - camLoc.z

            let vertHyp = getHypotenuse(ydiff, zdiff)
            let horzHyp = getHypotenuse(ydiff, xdiff)
            let vertAngle = Math.atan(zdiff/ydiff)
            let horzAngle = Math.atan(xdiff/ydiff)

            let shortVert = Math.tan(vertAngle) * viewPlane
            let shortHorz = Math.tan(horzAngle) * viewPlane

            shortHorz += ctx.canvas.width/2
            shortVert += ctx.canvas.height/2

            ctx.fillStyle = '#FF0000'
            ctx.fillRect(shortHorz, shortVert, 1, 1)
        }
    }

}

function getHypotenuse(leg1: number, leg2: number){
    return Math.pow(leg1, 2) + Math.pow(leg2, 2)
}

const Canvas = (props : CanvasProps) => {

    const canvasRef = useRef(null);

    const prevTime = useRef<number>(Date.now());
    const timeSinceStart = useRef<number>(0);

    const viewPlane: number = 1;

    const camLoc: Vector3 = new Vector3(0, -2, 0)

    let mat1: number[][] = [
        [1,2,3],
        [4,5,6],
        [7,8,9]
    ]
    let mat2: number[][] = [
        [9],
        [6],
        [4]
    ]

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
                ctx.fillRect(i * ctx.canvas.width / resolutionX, j * ctx.canvas.height / resolutionY, ctx.canvas.width / resolutionX, ctx.canvas.height / resolutionY)
                ctx.fill()

                // displayMatrix(ctx, mat3);
                
            }
        }
    }

    function displayMatrix(ctx: CanvasRenderingContext2D, mat:number[][], offset: Vector2){
        for(let k=0;k<mat[0].length;k++){
            for(let l=0; l<mat.length;l++){
                ctx.fillText(mat[l][k].toString(), k*18 + offset.x, (l*18) + offset.y)
            }
        }
    }


    useEffect(() => {

        if(!canvasRef.current){ return; }

        const canvas: HTMLCanvasElement = canvasRef.current
        const context: CanvasRenderingContext2D | null = canvas.getContext('2d')
        
        if(!context){ return; }

        let frameCount = 0
        let resolutionX = 512
        let resolutionY = 288
        let animationFrameId : number
        let deltaTime = Date.now() - prevTime.current;
        timeSinceStart.current += deltaTime;

        canvas.width = 512
        canvas.height = 288

        context.imageSmoothingEnabled = false;

        //Our draw came here
        const render = () => {
            frameCount++
            if(true){
                context.clearRect(0, 0, context.canvas.width, context.canvas.height)
                context.fillStyle = '#000000'
                context.fillRect(0, 0, context.canvas.width, context.canvas.height)

                let cube: Cube = new Cube(new Vector3(0, 0, 0), 1)
                cube.worldMatrix = MatrixMath.multiply(cube.worldMatrix, MatrixMath.Rz(0.01*frameCount))
                // cube.worldMatrix = MatrixMath.multiply(cube.worldMatrix, MatrixMath.Ry(45))
                test(context, [cube], camLoc)
                // draw(context, frameCount, resolutionX, resolutionY, deltaTime)
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