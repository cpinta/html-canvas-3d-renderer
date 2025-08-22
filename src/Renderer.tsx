import { Object3D, Vector3, Face, Mesh } from "./3D"
import { Cube } from "./Primitives"
import { Color, Vector2 } from "./2D"
import { MMath } from "./Matrix"


export class Renderer{
    
    objects: Object3D[] = []
    camLoc: Vector3 = new Vector3(0, 0, -3)
    fov: number = 90;

    nearPlane: number = 0
    farPlane: number = 10

    
    colors: Color[] = []

    constructor(){
        let cube: Cube = new Cube(new Vector3(0, 0, 0), 2)
        let obj: Object3D = new Object3D(cube)
        this.objects.push(obj)

        this.colors = [
            
            Color.fromHex('#0000FF'),
            Color.fromHex('#00AAEE'),
            Color.fromHex('#EEAA00'),
            Color.fromHex('#AAEEFF'),
            Color.fromHex('#FF00AA'),
            Color.fromHex('#AAAAFF'),
            Color.fromHex('#00FFAA')
        ]
    }
    
    draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scaleMultiplier: number, deltaTime: number, frameCount: number){
        this.objects[0].wRotate(new Vector3(0, 1 * deltaTime, 0))
        this.drawMeshes(canvas, ctx, scaleMultiplier)
    }

    setObj(obj: Object3D){
        this.objects[0] = obj
    }


    drawMeshes(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scaleMultiplier: number){
        let linesDrawn = 0
        let facesDrawn = 0
        let offScreens: MeshCanvasCombo[] = []
        let screenSpaceVerts: Vector3[] = [] 
        
        for(let j=0;j<this.objects.length;j++){
            let obj: Object3D = this.objects[j]
            let mesh: Mesh = obj.mesh

            let verts = obj.getWorldVerts()
            ctx.fillStyle = '#FF0000'

            for(let i=0;i<verts.length;i++){
                let xdiff = verts[i].x - this.camLoc.x
                let ydiff = verts[i].y - this.camLoc.y
                let zdiff = verts[i].z - this.camLoc.z

                let vertHyp = MMath.getHypotenuse(ydiff, zdiff)
                let horzHyp = MMath.getHypotenuse(ydiff, xdiff)
                let vertAngle = Math.atan(ydiff/zdiff)
                let horzAngle = Math.atan(xdiff/zdiff)

                let shortVert = Math.tan(vertAngle) * this.fov
                let shortHorz = Math.tan(horzAngle) * this.fov

                shortHorz *= scaleMultiplier
                shortVert *= scaleMultiplier
                shortHorz += ctx.canvas.width/2
                shortVert += ctx.canvas.height/2
                
                screenSpaceVerts[i] = new Vector3(shortHorz, shortVert, zdiff)

                if(mesh.vert2faceMap.has(i)){
                    let faceIndexes: number[] | undefined = mesh.vert2faceMap.get(i)
                    if(!faceIndexes){
                        continue
                    }
                    
                    for(let l=0;l<faceIndexes.length;l++){
                        let face: Face = mesh.faceArr[faceIndexes[l]]

                        if(faceIndexes[l] == 1){
                            console.log(this.colors[facesDrawn % this.colors.length])
                        }
                        let color = this.colors[facesDrawn % this.colors.length]

                        offScreens.push(new MeshCanvasCombo(null, face, color))
                        // let octx: OffscreenCanvasRenderingContext2D = offScreens[offScreens.length-1].osc.getContext("2d") as OffscreenCanvasRenderingContext2D

                        let averageDepth: number = 0

                        for(let m=0;m<face.vertIndexes.length;m++){
                            averageDepth += screenSpaceVerts[face.vertIndexes[m]].z
                        }

                        averageDepth /= face.vertIndexes.length * 2


                        offScreens[offScreens.length-1].face = face
                        offScreens[offScreens.length-1].depth = averageDepth
                        offScreens[offScreens.length-1].color = color
                        offScreens.sort(
                            function(a, b){
                                return b.depth - a.depth
                            }
                        )

                        facesDrawn++
                    }
                }

                // ctx.fillRect(shortHorz*4, shortVert*4, 1, 1)
            }
        }

        for(let i=0;i<offScreens.length;i++){
            // let bitmap = offScreens[i].osc.transferToImageBitmap()
            
            // ctx.drawImage(bitmap, 0,0)
            this.drawPolygon(ctx, screenSpaceVerts, offScreens[i].face, facesDrawn, offScreens[i].color)
        }
        ctx.fillStyle = '#00FF00'
        ctx.fillText(linesDrawn.toString(), 20, 20)
        ctx.fillText(facesDrawn.toString(), 20, 60)

    }

    drawPolygon(octx: CanvasRenderingContext2D, screenSpaceVerts: Vector3[], face: Face, facesDrawn: number, color: Color){
        octx.beginPath()

        for(let m=0;m<face.vertIndexes.length;m++){
            octx.lineTo(screenSpaceVerts[face.vertIndexes[m]].x, screenSpaceVerts[face.vertIndexes[m]].y)
        }
        octx.lineTo(screenSpaceVerts[face.vertIndexes[0]].x, screenSpaceVerts[face.vertIndexes[0]].y)


        octx.fillStyle = color.rgbaString()
        octx.strokeStyle = color.rgbaString()
        octx.closePath()
        octx.fill()
    }
}

export class MeshCanvasCombo {
    depth: number = -1
    face: Face
    osc: OffscreenCanvas | null
    color: Color

    constructor(osc: OffscreenCanvas | null, face: Face, color: Color){
        this.osc = osc
        this.face = face
        this.color = color
    }
}