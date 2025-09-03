import { Object3D, Vector3, Face, Mesh, Camera } from "./3D"
import { Cube, Line, Plane } from "./Primitives"
import { Color, Vector2 } from "./2D"
import { identityMatrix4, MMath } from "./Matrix"
import { inv } from "mathjs"
import FileImport3D from "./FileImport3D"

export type RendererProps = {
    ctx: CanvasRenderingContext2D,
    deltaTime: number, 
    frameCount: number
}

export class Renderer{
    
    camera: Camera = new Camera()
    objects: Object3D[] = []
    fov: number = 360;
    scaleMultiplier: number = 1
    dimensions: Vector2 = Vector2.zero()

    nearPlane: number = 0
    nearShade: number = 2
    farPlane: number = 4

    
    colors: Color[] = []

    constructor(){

        // let cube: Cube = new Cube(new Vector3(0, 0, 5), 1, Color.lightGreen)
        let island: Object3D = FileImport3D.ImportIsland()

        // this.objects.push(cube)
        this.objects.push(island)
        
        this.camera.wMovePosition(new Vector3(0, 2.45, 4.1))
        this.camera.wRotate(new Vector3(0,-Math.PI,0))
        this.camera.lRotate(new Vector3(-0.47,0,0))
    }

    setup(ctx: CanvasRenderingContext2D, scaleMultiplier: number){
        this.dimensions = new Vector2(ctx.canvas.width, ctx.canvas.height)
        this.scaleMultiplier = scaleMultiplier
    }

    displayMatrix(ctx: CanvasRenderingContext2D, mat:number[][], offset: Vector2){
        for(let k=0;k<mat[0].length;k++){
            for(let l=0; l<mat.length;l++){
                ctx.fillText((Math.trunc(mat[l][k] * 100) / 100).toString(), k*30 + offset.x, (l*18) + offset.y)
            }
        }
    }
    
    draw(props: RendererProps){
        this.drawMeshes(props.ctx)

        this.displayMatrix(props.ctx, this.camera.localMatrix, new Vector2(40, 20))
        this.displayMatrix(props.ctx, this.camera.worldMatrix, new Vector2(200, 20))
        this.displayMatrix(props.ctx, this.camera.combinedMatrix, new Vector2(360, 20))
        this.displayMatrix(props.ctx, this.camera.getFwdVector().toMatrix3(), new Vector2(580, 20))
    }

    setObj(obj: Object3D){
        this.objects.push(obj)
        // obj.wMovePosition(new Vector3(10,1,0))
    }


    getScreenSpaceOfVert(vert: Vector3){
        if(vert.z < this.nearPlane){
            return null
        }

        let shortVert = -vert.y/vert.z * this.fov
        let shortHorz = vert.x/vert.z * this.fov

        shortHorz *= this.scaleMultiplier
        shortVert *= this.scaleMultiplier

        shortHorz += this.dimensions.x/2
        shortVert += this.dimensions.y/2
        
        return new Vector3(shortHorz, shortVert, vert.z)
    }

    drawMeshes(ctx: CanvasRenderingContext2D){
        let linesDrawn = 0
        let facesDrawn = 0

        let worldScreenSpaceVerts: Vector3[] = [] 
        let screenSpaceFaces: FaceDepthStart[] = []
        
        for(let j=0;j<this.objects.length;j++){
            let obj: Object3D = this.objects[j]
            let mesh: Mesh = obj.mesh
            let localScreenSpaceVerts: Vector3[] = [] 

            let Wverts = obj.getWVerts()
            let verts = this.objVertsToCamera(obj)

            for(let i=0;i<verts.length;i++){
                let ssv = this.getScreenSpaceOfVert(verts[i])
                if(!ssv){
                    continue
                }

                localScreenSpaceVerts[i] = ssv

                if(mesh.vert2faceMap.has(i)){
                    let faceIndexes: number[] | undefined = mesh.vert2faceMap.get(i)
                    if(!faceIndexes){
                        continue
                    }
                    
                    let center: Vector3 = Vector3.zero()
                    for(let l=0;l<faceIndexes.length;l++){
                        let face: Face = mesh.faceArr[faceIndexes[l]]
                        let averageDepth: number = 0
                        let skipped: boolean = false

                        let avgVertLocation: Vector3 = Vector3.zero()
                        let avgWVertLocation: Vector3 = Vector3.zero()

                        for(let m=0;m<face.vertIndexes.length;m++){
                            if(face.vertIndexes[m] >= localScreenSpaceVerts.length || localScreenSpaceVerts[face.vertIndexes[m]] == undefined){
                                skipped = true
                                break
                            }
                            
                            averageDepth += localScreenSpaceVerts[face.vertIndexes[m]].z

                            avgVertLocation = avgVertLocation.add(verts[face.vertIndexes[m]])
                            avgWVertLocation = avgWVertLocation.add(Wverts[face.vertIndexes[m]])
                        }
                        if(skipped){
                            continue
                        }

                        averageDepth /= face.vertIndexes.length * 2
                        avgVertLocation.divide(face.vertIndexes.length)
                        avgWVertLocation.divide(face.vertIndexes.length)


                        let normalVert: Vector3 = face.normal
                        let normalWVert = obj.getWVert(normalVert)
                        normalVert = this.worldVertToCamera(normalWVert)

                        let facingCamDot = avgWVertLocation.subtract(this.camera.getWPosition()).normalize().dotWith(face.normal)
                        
                        if(facingCamDot < 0){
                            screenSpaceFaces.push(new FaceDepthStart(face, worldScreenSpaceVerts.length, averageDepth, facingCamDot))
                        }
                    }
                }
            }

            worldScreenSpaceVerts = worldScreenSpaceVerts.concat(localScreenSpaceVerts)
        }

        for(let j=0;j<this.objects.length;j++){
            let obj: Object3D = this.objects[j]
            let mesh: Mesh = obj.mesh

        }

        screenSpaceFaces.sort(
            function(a, b){
                return b.depth - a.depth
            }
        )

        for(let i=0;i<screenSpaceFaces.length;i++){
            this.drawPolygon(ctx, worldScreenSpaceVerts, screenSpaceFaces[i], true)
            facesDrawn++
        }


        ctx.fillStyle = '#00FF00'
        ctx.fillText(linesDrawn.toString(), 20, 20)
        ctx.fillText(facesDrawn.toString(), 20, 60)
    }

    objVertsToCamera(obj: Object3D){
        let verts = obj.getWVerts()
        for(let i=0;i<verts.length;i++){
            verts[i] = this.worldVertToCamera(verts[i])
        }
        return verts
    }

    objVertToCamera(obj: Object3D, vert:Vector3){
        let newVert = obj.getWVert(vert)
        return this.worldVertToCamera(newVert)
    }

    worldVertToCamera(vert: Vector3){
        vert = MMath.toVector3(MMath.multiply(inv(this.camera.worldMatrix), vert.toMatrix4()))
        vert = MMath.toVector3(MMath.multiply(this.camera.localMatrix, vert.toMatrix4()))
        return vert
    }

    drawPolygon(ctx: CanvasRenderingContext2D, screenSpaceVerts: Vector3[], fdc: FaceDepthStart, isShaded: boolean = true){
        ctx.beginPath()
        let face: Face = fdc.face

        for(let m=0;m<face.vertIndexes.length;m++){
            let curInd: number = face.vertIndexes[m] + fdc.vertStartIndex
            ctx.lineTo(screenSpaceVerts[curInd].x, screenSpaceVerts[curInd].y)
        }
        ctx.lineTo(screenSpaceVerts[face.vertIndexes[0] + fdc.vertStartIndex].x, screenSpaceVerts[face.vertIndexes[0] + fdc.vertStartIndex].y)

        let newColor: Color = new Color(face.color.r, face.color.g, face.color.b, face.color.a)

        let newZ: number = ((this.farPlane)/(this.farPlane - this.nearShade)) + 1/fdc.depth *((-this.farPlane * this.nearShade)/(this.farPlane - this.nearShade)) 

        if(isShaded){
            newColor.r = face.color.r - ((1+fdc.dot) * 50)
            newColor.g = face.color.g - ((1+fdc.dot) * 50)
            newColor.b = face.color.b - ((1+fdc.dot) * 50)
            // newColor.r = (1-newZ) * newColor.r + newZ * Color.background.r
            // newColor.g = (1-newZ) * newColor.g + newZ * Color.background.g
            // newColor.b = (1-newZ) * newColor.b + newZ * Color.background.b
        }

        ctx.fillStyle = newColor.rgbaString()
        ctx.strokeStyle = newColor.rgbaString()

        ctx.closePath()
        ctx.stroke()
        ctx.fill()

        if(fdc.isDebug){
            ctx.fillStyle = Color.lightPurple.toHex()
            ctx.fillText(fdc.debugText, screenSpaceVerts[face.vertIndexes[face.vertIndexes.length-1] + fdc.vertStartIndex].x, screenSpaceVerts[face.vertIndexes[face.vertIndexes.length-1] + fdc.vertStartIndex].y)
        }
    }
}

export class FaceDepthStart {
    face: Face
    depth: number = -1
    dot: number = -1
    vertStartIndex: number = 0
    isDebug: boolean
    debugText: string = ""

    constructor(face: Face, vertStartIndex: number, depth: number, dot:number, debugText: string = ""){
        this.face = face
        this.vertStartIndex = vertStartIndex
        this.depth = depth
        this.dot = dot
        
        this.isDebug = debugText != ""
        this.debugText = debugText
    }
}