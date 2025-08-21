
import { identityMatrix3, identityMatrix4, MMath } from "./Matrix"

export class Object3D{
    name: string = ""
    objectMatrix: number[][] = structuredClone(identityMatrix3)
    worldMatrix: number[][] = structuredClone(identityMatrix3)
    mesh: Mesh

    constructor(mesh: Mesh, name = ""){
        this.mesh = mesh
        this.name = name
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

    //key = largestEdgeIndex, value = faceIndex
    vert2faceMap: Map<number, number[]> = new Map()
    faceArr: Face[] = new Array()

    constructor(verts : Vector3[], faces:number[][]){
        this.rawVerts = verts
        for(let i=0;i<faces.length;i++){
            this.createFace(faces[i])
        }
    }

    createFace(vertIndexes:number[]){
        let face: Face = new Face(vertIndexes)

        this.faceArr.push(face)
        if(this.vert2faceMap.has(face.largestVertIndex)){
            this.vert2faceMap.get(face.largestVertIndex)?.push(this.faceArr.length - 1)
        }
        else{
            this.vert2faceMap.set(face.largestVertIndex, [this.faceArr.length - 1])
        }
    }
}

export class Face {
    vertIndexes: number[]
    largestVertIndex: number = -1

    constructor(vertIndexes: number[]){
        if(vertIndexes.length < 3){
            throw new Error("Invalid face")
        }
        this.vertIndexes = vertIndexes
        for(let i=0;i<vertIndexes.length;i++){
            if(vertIndexes[i] > this.largestVertIndex){
                this.largestVertIndex = vertIndexes[i]
            }
        }
    }
}
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