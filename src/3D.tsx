
import { identityMatrix3, identityMatrix4, MMath } from "./Matrix"

export class Vector3 {
    x: number;
    y: number;
    z: number;

    constructor(x : number, y : number, z : number){
        this.x = x
        this.y = y
        this.z = z
    }

    translate(x:number, y:number, z:number){
        let matrix = structuredClone(identityMatrix4)
        matrix[0][3] = x;
        matrix[1][3] = y;
        matrix[2][3] = z;
        let newVec = MMath.multiply(matrix, [[x],[y],[z]]);
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

export class Object3D{
    objectMatrix: number[][] = structuredClone(identityMatrix3)
    worldMatrix: number[][] = structuredClone(identityMatrix3)
    mesh: Mesh

    constructor(mesh: Mesh){
        this.mesh = mesh
    }

    getWorldVerts(): Vector3[]{
       let worldVerts: Vector3[] = []
        for(let i = 0; i < this.mesh.rawVerts.length; i++){
            worldVerts[i] = MMath.toVector3(MMath.multiply(this.worldMatrix, this.mesh.rawVerts[i].toMatrix3()))
        }
       return worldVerts
    }
    
    wRotate(rotation: Vector3){
        this.worldMatrix = MMath.rotate(this.worldMatrix, rotation)
    }
}

export class Mesh {
    rawVerts: Vector3[]

    edgeMap: Map<number, number[]> = new Map()
    faceMap: Map<number, number[][]> = new Map()

    constructor(verts : Vector3[], edges: number[][]){
        this.rawVerts = verts
        for(let i=0;i<edges.length;i++){
            this.createEdge(edges[i][0], edges[i][1])
        }
    }
    

    createEdge(vertIndex1: number, vertIndex2: number){
        if(this.edgeMap.has(vertIndex1)){
            this.edgeMap.get(vertIndex1)?.push(vertIndex2)
            this.edgeMap.get(vertIndex1)?.sort(
                function(a, b){
                    return a - b
                }
            )
        }
        else{
            this.edgeMap.set(vertIndex1, [vertIndex2])
        }

        if(this.edgeMap.has(vertIndex2)){
            this.edgeMap.get(vertIndex2)?.push(vertIndex1)
            this.edgeMap.get(vertIndex2)?.sort(
                function(a, b){
                    return a - b
                }
            )
        }
        else{
            this.edgeMap.set(vertIndex2, [vertIndex1])
        }
    }

}


export class Cube extends Mesh {

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
