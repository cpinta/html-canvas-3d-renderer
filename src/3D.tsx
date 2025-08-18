
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

export class Face {
    edgeIndexes: number[]
    largestEdgeIndex: number
    largestVertIndex: number = -1

    constructor(edgeIndexes: number[]){
        if(edgeIndexes.length < 3){
            throw new Error("Invalid face")
        }
        this.edgeIndexes = edgeIndexes
        this.largestEdgeIndex = 0
        for(let i=1;i<edgeIndexes.length;i++){
            if(edgeIndexes[i] > this.largestEdgeIndex){
                this.largestEdgeIndex = edgeIndexes[i]
            }
        }
    }
}

export class Mesh {
    rawVerts: Vector3[]

    //key = vertIndex, value = edgeIndex
    vert2edgeMap: Map<number, number[]> = new Map()
    edgeArr: number[][]

    //key = largestEdgeIndex, value = faceIndex
    vert2faceMap: Map<number, Face[]> = new Map()
    faceArr: Face[] = new Array()

    constructor(verts : Vector3[], edges: number[][], faces:number[][]){
        this.rawVerts = verts
        for(let i=0;i<edges.length;i++){
            this.createEdge(edges[i][0], edges[i][1], i)
        }
        this.edgeArr = edges

        for(let i=0;i<faces.length;i++){
            this.createFace(faces[i])
        }
    }

    createEdge(vertIndex1: number, vertIndex2: number, edgeIndex: number){
        if(this.vert2edgeMap.has(vertIndex1)){
            this.vert2edgeMap.get(vertIndex1)?.push(edgeIndex)
            this.vert2edgeMap.get(vertIndex1)?.sort(
                function(a, b){
                    return a - b
                }
            )
        }
        else{
            this.vert2edgeMap.set(vertIndex1, [edgeIndex])
        }

        if(this.vert2edgeMap.has(vertIndex2)){
            this.vert2edgeMap.get(vertIndex2)?.push(edgeIndex)
            this.vert2edgeMap.get(vertIndex2)?.sort(
                function(a, b){
                    return a - b
                }
            )
        }
        else{
            this.vert2edgeMap.set(vertIndex2, [edgeIndex])
        }
    }

    createFace(edgeIndexes:number[]){
        let face: Face = new Face(edgeIndexes)

        for(let i=0;i<face.edgeIndexes.length;i++){
            if(this.edgeArr[face.edgeIndexes[i]][0] > face.largestVertIndex){
                face.largestVertIndex = this.edgeArr[face.edgeIndexes[i]][0]
            }
            if(this.edgeArr[face.edgeIndexes[i]][1] > face.largestVertIndex){
                face.largestVertIndex = this.edgeArr[face.edgeIndexes[i]][1]
            }
        }

        if(this.vert2faceMap.has(face.largestVertIndex)){
            this.vert2faceMap.get(face.largestVertIndex)?.push(face)
        }
        else{
            this.vert2faceMap.set(face.largestVertIndex, [face])
        }
    }
}