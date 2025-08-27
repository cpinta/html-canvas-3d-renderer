import { Color } from "./2D"
import { Face, Mesh, Vector3 } from "./3D"

export class Cube extends Mesh {

    constructor(origin: Vector3, size: number, color: Color){
        let verts: Vector3[] = []
        let edges: number[][] = []
        let faces: number[][] = []
        let faceObjs: Face[] = []

        let halfSize: number = size/2
        verts.push(new Vector3(origin.x + halfSize, origin.y + halfSize, origin.z + halfSize))
        verts.push(new Vector3(origin.x + halfSize, origin.y + halfSize, origin.z - halfSize))
        verts.push(new Vector3(origin.x + halfSize, origin.y - halfSize, origin.z + halfSize))
        verts.push(new Vector3(origin.x + halfSize, origin.y - halfSize, origin.z - halfSize))

        verts.push(new Vector3(origin.x - halfSize, origin.y + halfSize, origin.z + halfSize))
        verts.push(new Vector3(origin.x - halfSize, origin.y + halfSize, origin.z - halfSize))
        verts.push(new Vector3(origin.x - halfSize, origin.y - halfSize, origin.z + halfSize))
        verts.push(new Vector3(origin.x - halfSize, origin.y - halfSize, origin.z - halfSize))

        faceObjs.push(new Face([0,2,3,1], color))
        faceObjs.push(new Face([0,2,6,4], color))
        faceObjs.push(new Face([4,6,7,5], color))
        faceObjs.push(new Face([5,7,3,1], color))
        faceObjs.push(new Face([0,4,5,1], color))
        faceObjs.push(new Face([2,6,7,3], color))
        
        
        super(verts, faceObjs);
    }
}