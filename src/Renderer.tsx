import { Mesh, Object3D, Cube, Vector3 } from "./3D"
import { Vector2 } from "./2D"
import { MMath } from "./Matrix"


export class Renderer{
    
    meshes: Object3D[] = []
    camLoc: Vector3 = new Vector3(0, 0, -3)
    viewPlane: number = 1;

    constructor(){
        let cube: Cube = new Cube(new Vector3(0, 0, 0), 2)
        let obj: Object3D = new Object3D(cube)
        this.meshes.push(obj)
    }
    
    draw(ctx: CanvasRenderingContext2D, scaleMultiplier: number, deltaTime: number){
        this.meshes[0].wRotate(new Vector3(0, 1 * deltaTime, 0))
        this.drawMeshes(ctx, scaleMultiplier)
    }


    drawMeshes(ctx: CanvasRenderingContext2D, scaleMultiplier: number){
        let viewPlane = 90

        for(let j=0;j<this.meshes.length;j++){
            let verts = this.meshes[j].getWorldVerts()
            let screenSpaceVerts: Vector2[] = [] 
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

                if(this.meshes[j].mesh.edgeMap.has(i)){
                    let curEdges: number[] | undefined = this.meshes[j].mesh.edgeMap.get(i)
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
}

