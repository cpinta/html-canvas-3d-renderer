import { Mesh, Vector3 } from "./3D"

export class Cube extends Mesh {

    constructor(origin: Vector3, size: number){
        let verts: Vector3[] = []
        let edges: number[][] = []
        let faces: number[][] = []

        let halfSize: number = size/2
        verts.push(new Vector3(origin.x + halfSize, origin.y + halfSize, origin.z + halfSize))
        verts.push(new Vector3(origin.x + halfSize, origin.y + halfSize, origin.z - halfSize))
        verts.push(new Vector3(origin.x + halfSize, origin.y - halfSize, origin.z + halfSize))
        verts.push(new Vector3(origin.x + halfSize, origin.y - halfSize, origin.z - halfSize))

        verts.push(new Vector3(origin.x - halfSize, origin.y + halfSize, origin.z + halfSize))
        verts.push(new Vector3(origin.x - halfSize, origin.y + halfSize, origin.z - halfSize))
        verts.push(new Vector3(origin.x - halfSize, origin.y - halfSize, origin.z + halfSize))
        verts.push(new Vector3(origin.x - halfSize, origin.y - halfSize, origin.z - halfSize))

        edges.push([0,1])   //0
        edges.push([0,2])   //1
        edges.push([0,4])   //2
        edges.push([1,3])   //3
        edges.push([1,5])   //4
        edges.push([2,3])   //5
        edges.push([2,6])   //6
        edges.push([3,7])   //7
        edges.push([4,5])   //8
        edges.push([4,6])   //9
        edges.push([5,7])   //10
        edges.push([6,7])   //11

        faces.push([0,1,3,5])
        faces.push([1,2,6,9])
        faces.push([8,9,10,11])
        faces.push([3,4,7,10])
        
        faces.push([0,2,4,8])
        faces.push([5,6,7,11])
        
        
        super(verts, edges);
    }
}
