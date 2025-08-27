import { Color } from "./2D"
import { Face, Mesh, Object3D, Vector3 } from "./3D"

export class Cube extends Object3D {

    constructor(origin: Vector3, size: number, color: Color){
        let verts: Vector3[] = []
        let faces: Face[] = []

        let halfSize: number = size/2
        verts.push(new Vector3(origin.x + halfSize, origin.y + halfSize, origin.z + halfSize))
        verts.push(new Vector3(origin.x + halfSize, origin.y + halfSize, origin.z - halfSize))
        verts.push(new Vector3(origin.x + halfSize, origin.y - halfSize, origin.z + halfSize))
        verts.push(new Vector3(origin.x + halfSize, origin.y - halfSize, origin.z - halfSize))

        verts.push(new Vector3(origin.x - halfSize, origin.y + halfSize, origin.z + halfSize))
        verts.push(new Vector3(origin.x - halfSize, origin.y + halfSize, origin.z - halfSize))
        verts.push(new Vector3(origin.x - halfSize, origin.y - halfSize, origin.z + halfSize))
        verts.push(new Vector3(origin.x - halfSize, origin.y - halfSize, origin.z - halfSize))

        faces.push(new Face([0,2,3,1], color))
        faces.push(new Face([0,2,6,4], color))
        faces.push(new Face([4,6,7,5], color))
        faces.push(new Face([5,7,3,1], color))
        faces.push(new Face([0,4,5,1], color))
        faces.push(new Face([2,6,7,3], color))

        let mesh: Mesh = new Mesh(verts, faces)
        
        super(mesh);
    }
}

export class Plane extends Object3D {

    constructor(origin: Vector3, size: number, color: Color){
        let verts: Vector3[] = []
        let faces: Face[] = []

        let halfSize: number = size/2
        verts.push(new Vector3(origin.x + halfSize, origin.y, origin.z + halfSize))
        verts.push(new Vector3(origin.x + halfSize, origin.y, origin.z - halfSize))

        verts.push(new Vector3(origin.x - halfSize, origin.y, origin.z - halfSize))
        verts.push(new Vector3(origin.x - halfSize, origin.y, origin.z + halfSize))

        faces.push(new Face([0,1,2,3], color, new Vector3(0,1,0)))
        
        let mesh: Mesh = new Mesh(verts, faces)

        super(mesh);
    }
}

export class Line extends Object3D {

    constructor(start:Vector3, end:Vector3, color: Color){
        let verts: Vector3[] = []
        let faces: Face[] = []

        verts.push(start)
        verts.push(end)

        faces.push(new Face([0,1], color))
        
        let mesh: Mesh = new Mesh(verts, faces)

        super(mesh);
    }
}