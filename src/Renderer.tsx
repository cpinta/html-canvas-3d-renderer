import { Object3D, Vector3, Face, Mesh, Camera } from "./3D"
import { Color, General, Vector2 } from "./2D"
import { MMath } from "./Matrix"
import { inv } from "mathjs"
import FileImport3D from "./FileImport3D"

export type RendererProps = {
    ctx: CanvasRenderingContext2D,
    deltaTime: number, 
    frameCount: number
}

export class Renderer{
    
    camera: Camera = new Camera()
    fov: number = 360*2;
    scaleMultiplier: number = 1
    renderDimensions: Vector2 = Vector2.zero()
    screenDimensions: Vector2 = Vector2.zero()
    fi: FrameInfo

    nearPlane: number = 0
    nearShade: number = 3
    farPlane: number = 4

    colors: Color[] = []

    mousePosition: Vector2 = Vector2.zero()

    constructor(){
        this.camera.resetRotation()
        this.fi = new FrameInfo(this.farPlane)
    }

    displayMatrix(ctx: CanvasRenderingContext2D, mat:number[][], offset: Vector2){
        for(let k=0;k<mat[0].length;k++){
            for(let l=0; l<mat.length;l++){
                ctx.fillText((Math.trunc(mat[l][k] * 100) / 100).toString(), k*30 + offset.x, (l*18) + offset.y)
            }
        }
    }
    
    draw(props: RendererProps, objects: Object3D[]){
        this.fi = new FrameInfo(this.farPlane)
        this.drawMeshes(props.ctx, objects)

        this.displayMatrix(props.ctx, this.camera.localMatrix, new Vector2(40, 20))
        this.displayMatrix(props.ctx, this.camera.worldMatrix, new Vector2(200, 20))
        this.displayMatrix(props.ctx, this.camera.combinedMatrix, new Vector2(360, 20))
        this.displayMatrix(props.ctx, this.camera.getFwdVector().toMatrix3(), new Vector2(580, 20))
    }

    setObjs(objs: Object3D[]){
        // objects.push(obj)
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

        shortHorz += this.renderDimensions.x/2
        shortVert += this.renderDimensions.y/2
        
        return new Vector3(shortHorz, shortVert, vert.z)
    }

    drawMeshes(ctx: CanvasRenderingContext2D, objects: Object3D[]){
        let linesDrawn = 0
        let facesDrawn = 0
        
        for(let j=0;j<objects.length;j++){
            let obj: Object3D = objects[j]
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

                        let normalMultiplied: Vector3 = MMath.toVector3(MMath.multiply(obj.localMatrix, face.normal.toMatrix4()))
                        normalMultiplied = MMath.toVector3(MMath.multiply(obj.worldMatrix, face.normal.toMatrix4())).normalize()
                        let facingCamDot = avgWVertLocation.subtract(this.camera.getWPosition()).normalize().dotWith(normalMultiplied)
                        
                        if(facingCamDot < 0){
                            this.fi.screenSpaceFaces.push(new FaceDepthStart(face, this.fi.worldScreenSpaceVerts.length, averageDepth, facingCamDot, General.truncate(facingCamDot, 2).toString()))
                        }
                    }
                }
            }

            this.fi.worldScreenSpaceVerts = this.fi.worldScreenSpaceVerts.concat(localScreenSpaceVerts)
        }

        for(let j=0;j<objects.length;j++){
            let obj: Object3D = objects[j]
            let mesh: Mesh = obj.mesh

        }

        this.fi.screenSpaceFaces.sort(
            function(a, b){
                return b.depth - a.depth
            }
        )

        for(let i=0;i<this.fi.screenSpaceFaces.length;i++){
            this.drawPolygon(ctx, this.fi.worldScreenSpaceVerts, this.fi.screenSpaceFaces[i], true)
            facesDrawn++
            
            if(this.fi.screenSpaceFaces[i].face.vertIndexes.length == 3){
                if(Vector2.pointInTriangle(this.fi.worldScreenSpaceVerts[this.fi.screenSpaceFaces[i].face.vertIndexes[0] + this.fi.screenSpaceFaces[i].vertStartIndex].toVector2xy(), this.fi.worldScreenSpaceVerts[this.fi.screenSpaceFaces[i].face.vertIndexes[1] + this.fi.screenSpaceFaces[i].vertStartIndex].toVector2xy(), this.fi.worldScreenSpaceVerts[this.fi.screenSpaceFaces[i].face.vertIndexes[2] + this.fi.screenSpaceFaces[i].vertStartIndex].toVector2xy(), this.screenSpaceMousePosition())){
                    if(this.fi.mouseHoverPosTriDepth > this.fi.screenSpaceFaces[i].depth){
                        this.fi.mouseHoverPosTriIndex = i
                        this.fi.mouseHoverPosTriDepth = this.fi.screenSpaceFaces[i].depth
                    }
                }
            }
        }
        
        for(let i=0;i<this.fi.screenSpaceFaces.length;i++){
            // this.drawPolygon(ctx, worldScreenSpaceVerts, screenSpaceFaces[i], false, true, true)
            // facesDrawn++
        }


        ctx.fillStyle = '#00FF00'
        ctx.fillText(linesDrawn.toString(), 20, 20)
        ctx.fillStyle = '#FF0000'
        ctx.fillText(facesDrawn.toString(), 20, 60)
        ctx.fillStyle = '#FFFF00'
        ctx.fillText(this.screenSpaceMousePosition().toString(), 20, 120)
        ctx.fillText(this.mousePosition.toString(), 20, 140)
        ctx.fillText(this.renderDimensions.toString(), 20, 160)
        ctx.fillStyle = '#00FF00'
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

    drawPolygon(ctx: CanvasRenderingContext2D, screenSpaceVerts: Vector3[], fdc: FaceDepthStart, isShaded: boolean = true, drawDebug: boolean = false, onlyDebug: boolean = false, overrideColor: Color | null = null){
        let face: Face = fdc.face
        if(!onlyDebug){
            ctx.beginPath()

            for(let m=0;m<face.vertIndexes.length;m++){
                let curInd: number = face.vertIndexes[m] + fdc.vertStartIndex
                ctx.lineTo(screenSpaceVerts[curInd].x, screenSpaceVerts[curInd].y)
            }
            ctx.lineTo(screenSpaceVerts[face.vertIndexes[0] + fdc.vertStartIndex].x, screenSpaceVerts[face.vertIndexes[0] + fdc.vertStartIndex].y)

            let newColor: Color = new Color(face.color.r, face.color.g, face.color.b, face.color.a)

            let newZ: number = ((this.farPlane)/(this.farPlane - this.nearShade)) + 1/fdc.depth *((-this.farPlane * this.nearShade)/(this.farPlane - this.nearShade))

            if(overrideColor){
                newColor = overrideColor
            }

            if(isShaded){
                newColor.r = face.color.r - ((fdc.dot/6) * 500)
                newColor.g = face.color.g - ((fdc.dot/6) * 500)
                newColor.b = face.color.b - ((fdc.dot/6) * 500)
                // newColor.r = (1-newZ) * newColor.r + newZ * Color.background.r
                // newColor.g = (1-newZ) * newColor.g + newZ * Color.background.g
                // newColor.b = (1-newZ) * newColor.b + newZ * Color.background.b
            }

            ctx.fillStyle = newColor.rgbaString()
            ctx.strokeStyle = newColor.rgbaString()

            ctx.closePath()
            ctx.stroke()
            ctx.fill()
        }

        if(fdc.isDebug && drawDebug){
            ctx.fillStyle = Color.white.toHex()
            let avgV3: Vector3 = Vector3.zero()
            for(let i=0;i<face.vertIndexes.length;i++){
                let curInd: number = face.vertIndexes[i] + fdc.vertStartIndex
                avgV3 = avgV3.add(screenSpaceVerts[curInd])
            }
            avgV3 = avgV3.divide(face.vertIndexes.length)
            ctx.fillText(fdc.debugText, avgV3.x, avgV3.y)
        }
    }

    clear(ctx: CanvasRenderingContext2D){
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        ctx.fillStyle = Color.background.toHex()
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    }

    screenSpaceMousePosition(){
        return new Vector2( this.mousePosition.x*(this.renderDimensions.x/this.screenDimensions.x) , this.mousePosition.y* (this.renderDimensions.y/this.screenDimensions.y) )
    }
}

export class FrameInfo{
    worldScreenSpaceVerts: Vector3[] = [] 
    screenSpaceFaces: FaceDepthStart[] = []
    
    mouseHoverPosTriDepth: number = 20
    mouseHoverPosTriIndex: number = -1

    constructor(farPlane: number){
        this.mouseHoverPosTriDepth = farPlane
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