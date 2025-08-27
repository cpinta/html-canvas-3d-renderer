import { Object3D, Vector3, Face, Mesh, Camera } from "./3D"
import { Cube } from "./Primitives"
import { Color, Vector2 } from "./2D"
import { identityMatrix4, MMath } from "./Matrix"
import { inv } from "mathjs"

export type RendererProps = {
    canvas: HTMLCanvasElement, 
    ctx: CanvasRenderingContext2D, 
    scaleMultiplier: number, 
    deltaTime: number, 
    frameCount: number
}

export class Renderer{
    
    camera: Camera = new Camera()
    objects: Object3D[] = []
    fov: number = 90;

    nearPlane: number = 1
    farPlane: number = 50

    
    colors: Color[] = []

    constructor(){
        this.colors = [
            
            Color.fromHex('#0000FF'),
            Color.fromHex('#00AAEE'),
            Color.fromHex('#EEAA00'),
            Color.fromHex('#AAEEFF'),
            Color.fromHex('#FF00AA'),
            Color.fromHex('#AAAAFF'),
            Color.fromHex('#00FFAA')
        ]


        
        let cube: Cube = new Cube(new Vector3(0, 0, 3), 2)
        let cube2: Cube = new Cube(new Vector3(3, 0, 0), 2)
        this.camera.wMovePosition(new Vector3(0, 0, 0))
        let obj: Object3D = new Object3D(cube)
        let obj2: Object3D = new Object3D(cube2)
        this.objects.push(obj)
        this.objects.push(obj2)
        
        
    }

    displayMatrix(ctx: CanvasRenderingContext2D, mat:number[][], offset: Vector2){
        for(let k=0;k<mat[0].length;k++){
            for(let l=0; l<mat.length;l++){
                ctx.fillText((Math.trunc(mat[l][k] * 100) / 100).toString(), k*30 + offset.x, (l*18) + offset.y)
            }
        }
    }
    
    draw(props: RendererProps){
        // this.objects[0].lRotate(new Vector3(0, 1 * deltaTime, 0))
        // this.objects[0].lMovePosition(new Vector3(1 * deltaTime, 0 ,0))
        // this.objects[0].wRotate(new Vector3(0, 1 * deltaTime, 0))
        // this.objects[0].wMovePosition(new Vector3(0, 0, 1* deltaTime))
        // this.objects[0].wPosition(new Vector3(0, 0, 1 * deltaTime))
        // this.camera.wRotate(new Vector3(0, 2 *deltaTime, 0))
        this.drawMeshes(props.canvas, props.ctx, props.scaleMultiplier)

        let mat: number[][] = [
            [6,1,1],
            [4,-2,5], 
            [2,8,7]
        ]
        let mat4: number[][] = [
            [6,1,1,1],
            [4,-2,5,5], 
            [2,8,7,7],
            [9,8,7,6]
        ]
        let matarr: number[] = [
            6,1,1,
            4,-2,5,
            2,8,7
        ]

        //MMath.multiply(this.camera.localMatrix, this.camera.worldMatrix)
        this.displayMatrix(props.ctx, this.camera.localMatrix, new Vector2(40, 20))
        props.ctx.fillText(MMath.det(mat4).toString(), 200, 20)
        // this.displayMatrix(ctx, this.objects[0].worldMatrix, new Vector2(200, 20))
        // this.displayMatrix(ctx, MMath.getTransformMatrix(this.objects[0].localMatrix), new Vector2(200, 20))
    }

    setObj(obj: Object3D){
        this.objects[0] = obj
        this.objects[0].worldMatrix = identityMatrix4
    }


    drawMeshes(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scaleMultiplier: number){
        let linesDrawn = 0
        let facesDrawn = 0
        let screenSpaceFaces: FaceDepthColor[] = []

        let worldScreenSpaceVerts: Vector3[] = [] 
        
        for(let j=0;j<this.objects.length;j++){
            let obj: Object3D = this.objects[j]
            let mesh: Mesh = obj.mesh
            let localScreenSpaceVerts: Vector3[] = [] 

            let verts = obj.getWorldVerts()
            for(let i=0;i<verts.length;i++){
                verts[i] = MMath.toVector3(MMath.multiply(inv(this.camera.worldMatrix), verts[i].toMatrix4()))
                verts[i] = MMath.toVector3(MMath.multiply(this.camera.localMatrix, verts[i].toMatrix4()))
            }

            for(let i=0;i<verts.length;i++){
                let camPos: Vector3 = this.camera.getWPosition()
                let xdiff = verts[i].x
                let ydiff = verts[i].y
                let zdiff = verts[i].z

                if(zdiff < this.nearPlane){
                    continue
                }

                let vertHyp = MMath.getHypotenuse(ydiff, zdiff)
                let horzHyp = MMath.getHypotenuse(ydiff, xdiff)
                let vertAngle = Math.atan(ydiff/zdiff)
                let horzAngle = Math.atan(xdiff/zdiff)

                let shortVert = Math.tan(-vertAngle) * this.fov
                let shortHorz = Math.tan(horzAngle) * this.fov

                shortHorz *= scaleMultiplier
                shortVert *= scaleMultiplier
                shortHorz += ctx.canvas.width/2
                shortVert += ctx.canvas.height/2
                
                localScreenSpaceVerts[i] = new Vector3(shortHorz, shortVert, zdiff)

                if(mesh.vert2faceMap.has(i)){
                    let faceIndexes: number[] | undefined = mesh.vert2faceMap.get(i)
                    if(!faceIndexes){
                        continue
                    }
                    
                    for(let l=0;l<faceIndexes.length;l++){
                        let face: Face = mesh.faceArr[faceIndexes[l]]

                        if(faceIndexes[l] == 1){
                            // console.log(this.colors[facesDrawn % this.colors.length])
                        }
                        let color = this.colors[facesDrawn % this.colors.length]

                        screenSpaceFaces.push(new FaceDepthColor(face, color, worldScreenSpaceVerts.length))
                        // let octx: OffscreenCanvasRenderingContext2D = offScreens[offScreens.length-1].osc.getContext("2d") as OffscreenCanvasRenderingContext2D

                        let averageDepth: number = 0

                        let skipped: boolean = false
                        for(let m=0;m<face.vertIndexes.length;m++){
                            if(face.vertIndexes[m] >= localScreenSpaceVerts.length || localScreenSpaceVerts[face.vertIndexes[m]] == undefined){
                                skipped = true
                                break
                            }
                            averageDepth += localScreenSpaceVerts[face.vertIndexes[m]].z
                        }
                        if(skipped){
                            screenSpaceFaces.pop()
                            continue
                        }

                        averageDepth /= face.vertIndexes.length * 2


                        screenSpaceFaces[screenSpaceFaces.length-1].depth = averageDepth

                        facesDrawn++
                    }
                }

                // ctx.fillRect(shortHorz*4, shortVert*4, 1, 1)
            }

            worldScreenSpaceVerts = worldScreenSpaceVerts.concat(localScreenSpaceVerts)
        }
        screenSpaceFaces.sort(
            function(a, b){
                return b.depth - a.depth
            }
        )

        for(let i=0;i<screenSpaceFaces.length;i++){
            // let bitmap = offScreens[i].osc.transferToImageBitmap()
            
            // ctx.drawImage(bitmap, 0,0)
            this.drawPolygon(ctx, worldScreenSpaceVerts, screenSpaceFaces[i])
        }
        ctx.fillStyle = '#00FF00'
        ctx.fillText(linesDrawn.toString(), 20, 20)
        ctx.fillText(facesDrawn.toString(), 20, 60)

    }

    drawPolygon(ctx: CanvasRenderingContext2D, screenSpaceVerts: Vector3[], fdc: FaceDepthColor){
        ctx.beginPath()
        let face: Face = fdc.face

        for(let m=0;m<face.vertIndexes.length;m++){
            ctx.lineTo(screenSpaceVerts[face.vertIndexes[m] + fdc.vertStartIndex].x, screenSpaceVerts[face.vertIndexes[m] + fdc.vertStartIndex].y)
        }
        ctx.lineTo(screenSpaceVerts[face.vertIndexes[0] + fdc.vertStartIndex].x, screenSpaceVerts[face.vertIndexes[0] + fdc.vertStartIndex].y)

        let newColor: Color = new Color(fdc.color.r, fdc.color.g, fdc.color.b, fdc.color.a)

        let newZ: number = ((this.farPlane)/(this.farPlane - this.nearPlane)) + 1/fdc.depth *((-this.farPlane * this.nearPlane)/(this.farPlane - this.nearPlane))

        newColor.r = fdc.color.r -(fdc.color.r * newZ);
        newColor.g = fdc.color.g -(fdc.color.g * newZ);
        newColor.b = fdc.color.b -(fdc.color.b * newZ);

        // octx.fillStyle = 'white'
        // octx.fillText(newZ.toString(), screenSpaceVerts[face.vertIndexes[1]].x, screenSpaceVerts[face.vertIndexes[1]].y)

        ctx.fillStyle = newColor.rgbaString()
        ctx.strokeStyle = newColor.rgbaString()


        ctx.closePath()
        ctx.stroke()
        ctx.fill()
    }
}

export class FaceDepthColor {
    vertStartIndex: number = 0
    depth: number = -1
    face: Face
    color: Color

    constructor(face: Face, color: Color, vertStartIndex: number){
        this.face = face
        this.color = color
        this.vertStartIndex = vertStartIndex
    }
}