import { ECDH } from 'crypto';
import React, { KeyboardEvent, useEffect, useRef } from 'react';

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

    static rotate(matrix: number[][], rotation: Vector3){
        return this.multiply(matrix, this.multiply(this.Rx(rotation.x), this.multiply(this.Ry(rotation.y), this.Rz(rotation.z))))
    }

    static move(matrix: number[][], offset: Vector3){
        let idMatrix = structuredClone(identityMatrix3)
        idMatrix[0][3] = offset.x;
        idMatrix[1][3] = offset.y;
        idMatrix[2][3] = offset.z;
        return MatrixMath.multiply(matrix, idMatrix);
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

    edges: Map<number, number[]> = new Map()

    constructor(verts : Vector3[], edges: number[][]){
        this.rawVerts = verts
        for(let i=0;i<edges.length;i++){
            this.createEdge(edges[i][0], edges[i][1])
        }
    }
    
    getWorldVerts(): Vector3[]{
       let worldVerts: Vector3[] = []
        for(let i = 0; i < this.rawVerts.length; i++){
            worldVerts[i] = MatrixMath.toVector3(MatrixMath.multiply(this.worldMatrix, this.rawVerts[i].toMatrix3()))
        }
       return worldVerts
    }

    createEdge(vertIndex1: number, vertIndex2: number){
        if(this.edges.has(vertIndex1)){
            this.edges.get(vertIndex1)?.push(vertIndex2)
            this.edges.get(vertIndex1)?.sort(
                function(a, b){
                    return a - b
                }
            )
        }
        else{
            this.edges.set(vertIndex1, [vertIndex2])
        }

        if(this.edges.has(vertIndex2)){
            this.edges.get(vertIndex2)?.push(vertIndex1)
            this.edges.get(vertIndex2)?.sort(
                function(a, b){
                    return a - b
                }
            )
        }
        else{
            this.edges.set(vertIndex2, [vertIndex1])
        }
    }

    wRotate(rotation: Vector3){
        this.worldMatrix = MatrixMath.rotate(this.worldMatrix, rotation)
    }
}


class Cube extends Mesh {

    constructor(origin: Vector3, size: number){
        let verts: Vector3[] = []
        let edges: number[][] = []
        let halfSize: number = size/2
        verts.push(new Vector3(origin.x + halfSize, origin.y + halfSize, origin.z + halfSize))
        verts.push(new Vector3(origin.x + halfSize, origin.y + halfSize, origin.z - halfSize))
        verts.push(new Vector3(origin.x + halfSize, origin.y - halfSize, origin.z + halfSize))
        verts.push(new Vector3(origin.x + halfSize, origin.y - halfSize, origin.z - halfSize))

        verts.push(new Vector3(origin.x - halfSize, origin.y + halfSize, origin.z + halfSize))
        verts.push(new Vector3(origin.x - halfSize, origin.y + halfSize, origin.z - halfSize))
        verts.push(new Vector3(origin.x - halfSize, origin.y - halfSize, origin.z + halfSize))
        verts.push(new Vector3(origin.x - halfSize, origin.y - halfSize, origin.z - halfSize))

        edges.push([0,1])
        edges.push([0,2])
        edges.push([0,4])
        edges.push([1,3])
        edges.push([1,5])
        edges.push([2,3])
        edges.push([2,6])
        edges.push([3,7])
        edges.push([4,5])
        edges.push([4,6])
        edges.push([5,7])
        edges.push([6,7])
        
        super(verts, edges);
    }
}

function drawMeshes(ctx: CanvasRenderingContext2D, meshes: Mesh[], camLoc: Vector3, scaleMultiplier: number){
    let viewPlane = 90

    for(let j=0;j<meshes.length;j++){
        let verts = meshes[j].getWorldVerts()
        let screenSpaceVerts: Vector2[] = [] 
        for(let i=0;i<verts.length;i++){
            let xdiff = verts[i].x - camLoc.x
            let ydiff = verts[i].y - camLoc.y
            let zdiff = verts[i].z - camLoc.z

            let vertHyp = getHypotenuse(ydiff, zdiff)
            let horzHyp = getHypotenuse(ydiff, xdiff)
            let vertAngle = Math.atan(ydiff/zdiff)
            let horzAngle = Math.atan(xdiff/zdiff)

            let shortVert = Math.tan(vertAngle) * viewPlane
            let shortHorz = Math.tan(horzAngle) * viewPlane

            shortHorz *= scaleMultiplier
            shortVert *= scaleMultiplier
            shortHorz += ctx.canvas.width/2
            shortVert += ctx.canvas.height/2
            

            screenSpaceVerts[i] = new Vector2(shortHorz, shortVert)

            if(meshes[j].edges.has(i)){
                let curEdges: number[] | undefined = meshes[j].edges.get(i)
                if(!curEdges){
                    continue
                }

                let edgeIndex: number = 0
                while(curEdges[edgeIndex] < i){
                    ctx.beginPath()
                    ctx.moveTo(screenSpaceVerts[i].x, screenSpaceVerts[i].y)
                    ctx.lineTo(screenSpaceVerts[curEdges[edgeIndex]].x, screenSpaceVerts[curEdges[edgeIndex]].y)
                    ctx.stroke()
                    ctx.closePath()

                    edgeIndex++;
                    if(edgeIndex !< curEdges.length){
                        continue
                    }
                }
            }

            ctx.fillStyle = '#FF0000'
            // ctx.fillRect(shortHorz*4, shortVert*4, 1, 1)
            // ctx.fillStyle = '#00FF00'
            // ctx.fillText(i.toString(), shortHorz, shortVert)
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

    const meshes = useRef<Mesh[]>([])


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

    const camLoc: Vector3 = new Vector3(0, 0, -3)

    useEffect(() => {

        if(!canvasRef.current){ return; }

        const canvas: HTMLCanvasElement = canvasRef.current
        const context: CanvasRenderingContext2D | null = canvas.getContext('2d')
        
        if(!context){ return; }

        let frameCount = 0
        let resolutionX = 512*4
        let resolutionY = 288*4
        let animationFrameId : number
        let deltaTime = Date.now() - prevTime.current;
        timeSinceStart.current += deltaTime;

        let displayScale = 4
        canvas.width = 512 * displayScale
        canvas.height = 288 * displayScale

        context.imageSmoothingEnabled = false;
        context.lineWidth = 1
        context.strokeStyle = '#FF0000'

        let cube: Cube = new Cube(new Vector3(0, 0, 0), 2)
        cube.worldMatrix = MatrixMath.multiply(cube.worldMatrix, MatrixMath.Ry(0.01*frameCount))
        cube.worldMatrix = MatrixMath.move(cube.worldMatrix, new Vector3(0, 100*frameCount, 0))
        meshes.current.push(cube)

        //Our draw came here
        const render = () => {
            frameCount++
            if(true){
                context.clearRect(0, 0, context.canvas.width, context.canvas.height)
                context.fillStyle = '#000000'
                context.fillRect(0, 0, context.canvas.width, context.canvas.height)

                inputTick()
                
                // meshes.current[0].worldMatrix = MatrixMath.multiply(meshes.current[0].worldMatrix, MatrixMath.Ry(0.01))
                drawMeshes(context, meshes.current, camLoc, displayScale)
                // draw(context, frameCount, resolutionX, resolutionY, deltaTime)
            }
            animationFrameId = window.requestAnimationFrame(render)
        }
        render()

        return () => {
            window.cancelAnimationFrame(animationFrameId)
        }
    }, [draw])


    window.addEventListener("keydown", e => handleKeyDown(e as any));
    window.addEventListener("keyup", e => handleKeyUp(e as any));
    // window.addEventListener("keyup", e => handleKeyUp(e));
    
    let keyTapMap: Map<string, ()=>void> = new Map()

    let keyHoldMap: Map<string, ()=>void> = new Map()
    keyHoldMap.set('ArrowUp', keyRotateUp)
    keyHoldMap.set('ArrowDown', keyRotateDown)


    function inputTick(){
        for(let i=0;i<keysPressed.length;i++){
            if(keyHoldMap.has(keysPressed[i])){
                keyHoldMap.get(keysPressed[i])?.call(null)
            }
        }
    }

    let keysPressed: string[] = []
    let keysPressedMap: Map<string, number> = new Map()

    function keyRotateUp(){
        keyRotate(new Vector3(0.05, 0, 0))
    }
    function keyRotateDown(){
        keyRotate(new Vector3(-0.05, 0, 0))
    }

    function keyRotate(dir: Vector3){
        meshes.current[0].wRotate(dir)
    }

    function handleKeyDown(e: KeyboardEvent) {
        console.log('key down', e.code)
        if(keyTapMap.has(e.code)){
            keyTapMap.get(e.code)?.call(null)
        }
        if(keyHoldMap.has(e.code)){
            if(keysPressedMap.has(e.code)){
                keysPressed.push(e.code)
                keysPressedMap.set(e.code, keysPressed.length-1)
            }
        }
        
    }
    function handleKeyUp(e: KeyboardEvent) {
        if(keysPressedMap.has(e.code)){
            let index: number | undefined = keysPressedMap.get(e.code)

            if(!index){
                keysPressedMap.delete(e.code)
                index = keysPressed.indexOf(e.code)
                if(index == -1){
                    return
                } 
                keysPressed.splice(index, 1)
                return
            }

            keysPressed.splice(index, 1)
            if(keysPressed.length > index){
                for(let i=index;i<keysPressed.length;i++){
                    keysPressedMap.set(keysPressed[i], i)
                }
            }
        }
    }




    return(
        <canvas ref={canvasRef} {...props} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} style={{width:100+`%`, height:'0%'}} />
    );
}

export default Canvas;