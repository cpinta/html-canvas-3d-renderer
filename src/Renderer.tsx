import { Object3D, Vector3, Face, Mesh } from "./3D"
import { Cube } from "./Primitives"
import { Vector2 } from "./2D"
import { MMath } from "./Matrix"


export class Renderer{
    
    objects: Object3D[] = []
    camLoc: Vector3 = new Vector3(0, 0, -2.25)
    viewPlane: number = 1;

    constructor(){
        let cube: Cube = new Cube(new Vector3(0, 0, 0), 2)
        let obj: Object3D = new Object3D(cube)
        this.objects.push(obj)
    }
    
    draw(ctx: CanvasRenderingContext2D, scaleMultiplier: number, deltaTime: number){
        this.objects[0].wRotate(new Vector3(0, 1 * deltaTime, 0))
        this.drawMeshes(ctx, scaleMultiplier)
    }

    setObj(obj: Object3D){
        this.objects[0] = obj
    }

    drawMeshes(ctx: CanvasRenderingContext2D, scaleMultiplier: number){
        let viewPlane = 90

        let linesDrawn = 0
        let facesDrawn = 0
        for(let j=0;j<this.objects.length;j++){
            let obj: Object3D = this.objects[j]
            let mesh: Mesh = obj.mesh
            let verts = obj.getWorldVerts()
            ctx.fillStyle = '#FF0000'

            let screenSpaceVerts: Vector2[] = [] 
            let screenSpaceEdges: number[]
            for(let i=0;i<verts.length;i++){
                let xdiff = verts[i].x - this.camLoc.x
                let ydiff = verts[i].y - this.camLoc.y
                let zdiff = verts[i].z - this.camLoc.z

                let vertHyp = MMath.getHypotenuse(ydiff, zdiff)
                let horzHyp = MMath.getHypotenuse(ydiff, xdiff)
                let vertAngle = Math.atan(ydiff/zdiff)
                let horzAngle = Math.atan(xdiff/zdiff)

                let shortVert = Math.tan(vertAngle) * viewPlane
                let shortHorz = Math.tan(horzAngle) * viewPlane

                shortHorz *= scaleMultiplier
                shortVert *= scaleMultiplier
                shortHorz += ctx.canvas.width/2
                shortVert += ctx.canvas.height/2
                

                screenSpaceVerts[i] = new Vector2(shortHorz, shortVert)


                ctx.strokeStyle = '#FF0000'
                if(mesh.vert2edgeMap.has(i)){
                    let currentEdgeIndexes: number[] | undefined = mesh.vert2edgeMap.get(i)
                    if(!currentEdgeIndexes){
                        continue
                    }

                    for(let k=0;k<currentEdgeIndexes.length;k++){
                        let edge: number[] = mesh.edgeArr[currentEdgeIndexes[k]]
                        if(edge[0] <= i && edge[1] <= i){
                            ctx.beginPath()
                            ctx.moveTo(screenSpaceVerts[edge[0]].x, screenSpaceVerts[edge[0]].y)
                            ctx.lineTo(screenSpaceVerts[edge[1]].x, screenSpaceVerts[edge[1]].y)
                            ctx.stroke()
                            ctx.closePath()
                            linesDrawn++
                        }
                    }
                }

                // ctx.fillStyle = '#0000FF'
                // ctx.strokeStyle = '#0000FF'
                if(mesh.vert2faceMap.has(i)){
                    let faces: Face[] | undefined = mesh.vert2faceMap.get(i)
                    if(!faces){
                        continue
                    }
                    let vertIndex: number = 0
                    for(let l=0;l<faces.length;l++){
                        let face: Face = faces[l]
                        ctx.beginPath()

                        let initialIndex: number = 0
                        let nextIndex: number = 0

                        let averageDepth: number = 0

                        let edge1:number[] = mesh.edgeArr[face.edgeIndexes[0]]
                        let edge2:number[] = mesh.edgeArr[face.edgeIndexes[1]]
                        
                        if(edge1[0] == edge2[0]){
                            ctx.moveTo(screenSpaceVerts[edge1[1]].x, screenSpaceVerts[edge1[1]].y)
                            ctx.lineTo(screenSpaceVerts[edge1[0]].x, screenSpaceVerts[edge1[0]].y)
                            nextIndex = 1
                            initialIndex = 1
                        }
                        else{
                            ctx.moveTo(screenSpaceVerts[edge1[0]].x, screenSpaceVerts[edge1[0]].y)
                            ctx.lineTo(screenSpaceVerts[edge1[1]].x, screenSpaceVerts[edge1[1]].y)
                            nextIndex = 1
                            initialIndex = 0
                        }
                        averageDepth += verts[edge1[0]].z
                        averageDepth += verts[edge1[1]].z

                        for(let m=1;m<face.edgeIndexes.length;m++){
                            let edgeIndex: number = face.edgeIndexes[m]
                            let curEdge:number[] = mesh.edgeArr[edgeIndex]

                            ctx.lineTo(screenSpaceVerts[curEdge[nextIndex]].x, screenSpaceVerts[curEdge[nextIndex]].y)
                            
                            ctx.fillStyle = '#ffffff'
                            ctx.font = "24px Arial"
                            ctx.fillText(curEdge[nextIndex].toString(), screenSpaceVerts[curEdge[nextIndex]].x + 10, screenSpaceVerts[curEdge[nextIndex]].y + 10)

                            averageDepth += verts[curEdge[nextIndex]].z

                            if(m+1 < face.edgeIndexes.length){
                                if(curEdge[0] == mesh.edgeArr[face.edgeIndexes[m+1]][0]){
                                    nextIndex = 0
                                }
                                else{
                                    nextIndex = 1
                                }
                            }
                        }
                        ctx.lineTo(screenSpaceVerts[mesh.edgeArr[face.edgeIndexes[0]][initialIndex]].x, screenSpaceVerts[mesh.edgeArr[face.edgeIndexes[0]][initialIndex]].y)
                        ctx.fillStyle = '#ffffff'
                        ctx.font = "24px Arial"
                        ctx.fillText(edge1[initialIndex].toString(), screenSpaceVerts[mesh.edgeArr[face.edgeIndexes[0]][initialIndex]].x + 10, screenSpaceVerts[mesh.edgeArr[face.edgeIndexes[0]][initialIndex]].y + 10)

                        averageDepth /= face.edgeIndexes.length * 2

                        let hex = this.colors[facesDrawn]


                        ctx.fillStyle = hex
                        ctx.strokeStyle = hex
                        ctx.closePath()
                        ctx.fill()
                        facesDrawn++
                    }
                }

                // ctx.fillRect(shortHorz*4, shortVert*4, 1, 1)
            }
        }
        ctx.strokeStyle = '#00FF00'
        ctx.strokeText(linesDrawn.toString(), 20, 20)
        ctx.strokeStyle = '#00FF00'
        ctx.strokeText(facesDrawn.toString(), 20, 60)

    }

    colors = [
        '#0000FF',
        '#00AAEE',
        '#EEAA00',
        '#AAEEFF',
        '#FF00AA',
        '#AAAAFF',
        '#00FFAA'
    ]

    drawPolygon(verts: number[]){
        
    }
}