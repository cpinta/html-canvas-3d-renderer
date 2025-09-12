
import { Color, General, Vector2 } from "./2D";
import { identityMatrix3, identityMatrix4, MMath } from "./Matrix"


export class Transform3D{
    localMatrix: number[][] = structuredClone(identityMatrix4)
    worldMatrix: number[][] = structuredClone(identityMatrix4)
    combinedMatrix: number[][] = structuredClone(identityMatrix4)
    isCombined: boolean = true

    getWPosition(){
        return new Vector3(this.worldMatrix[0][3], this.worldMatrix[1][3], this.worldMatrix[2][3]);
    }
    getLPosition(){
        return new Vector3(this.localMatrix[0][3], this.localMatrix[1][3], this.localMatrix[2][3]);
    }
    
    wRotate(rotation: Vector3){
        if(rotation.isZero()){
            return
        }
        this.worldMatrix = MMath.rotate(this.worldMatrix, rotation)
        this.matrixChanged()
    }

    wSetPosition(position: Vector3){
        this.worldMatrix = MMath.setPosition(this.worldMatrix, position)
        this.matrixChanged()
    }

    wMovePosition(position: Vector3){
        if(position.isZero()){
            return
        }
        this.worldMatrix = MMath.move(this.worldMatrix, position)
        this.matrixChanged()
    }
    
    lRotate(rotation: Vector3){
        if(rotation.isZero()){
            return
        }
        this.localMatrix = MMath.rotate(this.localMatrix, rotation)
        this.matrixChanged()
    }

    lSetPosition(position: Vector3){
        this.localMatrix = MMath.setPosition(this.localMatrix, position)
        this.matrixChanged()
    }

    lMovePosition(position: Vector3){
        if(position.isZero()){
            return
        }
        this.localMatrix = MMath.move(this.localMatrix, position)
        this.matrixChanged()
    }

    getCombinedMatrix(){
        if(!this.isCombined){
            this.combinedMatrix = MMath.multiply(this.localMatrix, this.worldMatrix)
            this.isCombined = true
        }
        return this.combinedMatrix
    }

    getFwdVector(){
        return new Vector3(this.getCombinedMatrix()[0][2], this.getCombinedMatrix()[1][2], this.getCombinedMatrix()[2][2])
    }

    matrixChanged(){
        this.isCombined = false
    }
    
    resetRotation(){
        this.localMatrix = structuredClone(identityMatrix4)
        this.worldMatrix = structuredClone(identityMatrix4)
        this.combinedMatrix = structuredClone(identityMatrix4)
    }
}

export class Camera extends Transform3D{
    camRotate(rotate:Vector2){
        this.lRotate(new Vector3(-rotate.y, 0, 0))
        this.wRotate(new Vector3(0, rotate.x, 0))
    }
    resetRotation(): void {
        super.resetRotation()
        this.wMovePosition(new Vector3(0, 2.45*1.6, 4.1*1.6))
        this.camRotate(new Vector2(-Math.PI,0.5))
    }
}

export class Object3D extends Transform3D{
    name: string = ""
    mesh: Mesh
    
    constructor(mesh: Mesh, name = ""){
        super()
        this.mesh = mesh
        this.name = name
        this.mesh.obj = this
    }

    getWVerts(): Vector3[]{
        let verts: Vector3[] = []
        if(!this.isCombined){
            this.getCombinedMatrix()
        }
        for(let i = 0; i < this.mesh.rawVerts.length; i++){
            verts[i] = MMath.toVector3(MMath.multiply(this.combinedMatrix, this.mesh.rawVerts[i].toMatrix4()))
        }
        return verts
    }

    getWVertIndex(index: number): Vector3{
        if(!this.isCombined){
            this.getCombinedMatrix()
        }
        return MMath.toVector3(MMath.multiply(this.combinedMatrix, this.mesh.rawVerts[index].toMatrix4()))
    }

    getWVert(vert: Vector3): Vector3{
        if(!this.isCombined){
            this.getCombinedMatrix()
        }
        return MMath.toVector3(MMath.multiply(this.combinedMatrix, vert.toMatrix4()))
    }

    getLVerts(): Vector3[]{
        let localVerts: Vector3[] = []
        for(let i = 0; i < this.mesh.rawVerts.length; i++){
            localVerts[i] = MMath.toVector3(MMath.multiply(this.localMatrix, this.mesh.rawVerts[i].toMatrix4()))
        }
        return localVerts
    }

    getLVert(vert: Vector3): Vector3{
        return MMath.toVector3(MMath.multiply(this.localMatrix, vert.toMatrix4()))
    }

    tick(deltaTime:number){

    }
}

export class Mesh {
    rawVerts: Vector3[]
    obj: Object3D | null = null

    //key = largestEdgeIndex, value = faceIndex
    vert2faceMap: Map<number, number[]> = new Map()
    faceArr: Face[] = new Array()

    constructor(verts : Vector3[], faces:Face[]){
        this.rawVerts = verts
        for(let i=0;i<faces.length;i++){
            this.addFace(faces[i])
        }
    }


    createFaceFromVertInds(vertIndexes:number[]){
        let face: Face = new Face(vertIndexes)
        this.addFace(face)
    }

    addFace(face: Face){
        face.mesh = this
        this.faceArr.push(face)
        if(this.vert2faceMap.has(face.largestVertIndex)){
            this.vert2faceMap.get(face.largestVertIndex)?.push(this.faceArr.length - 1)
        }
        else{
            this.vert2faceMap.set(face.largestVertIndex, [this.faceArr.length - 1])
        }
    }

    static empty(){
        return new Mesh([],[])
    }
}

export class Face {
    mesh: Mesh = Mesh.empty()
    vertIndexes: number[]
    largestVertIndex: number = -1
    normal: Vector3
    color: Color

    constructor(vertIndexes: number[], color: Color = Color.hotPink, normal: Vector3 = Vector3.one()){
        // if(vertIndexes.length < 3){
        //     throw new Error("Invalid face")
        // }
        this.vertIndexes = vertIndexes
        for(let i=0;i<vertIndexes.length;i++){
            if(vertIndexes[i] > this.largestVertIndex){
                this.largestVertIndex = vertIndexes[i]
            }
        }
        this.normal = normal
        this.color = color
    }

    setMesh(mesh:Mesh){
        this.mesh = mesh 
    }
}

export class Vector3 {
    x: number;
    y: number;
    z: number;

    constructor(x : number=0, y : number=0, z : number=0){
        this.x = x
        this.y = y
        this.z = z
    }

    static fromV3(v: Vector3){
        return new Vector3(v.x, v.y, v.z)
    }

    static zero(){
        return new Vector3(0, 0, 0)
    }
    static one(){
        return new Vector3(1, 1, 1)
    }
    isZero(){
        return this.x == 0 && this.y == 0 && this.z == 0
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

    toVector2xy():Vector2{
        return new Vector2(this.x, this.y)
    }
    toMatrix3(): number[][]{
        return [[this.x],[this.y],[this.z]]
    }
    toMatrix4(): number[][]{
        return [[this.x],[this.y],[this.z],[1]]
    }

    multiply(num: number){
        this.x *= num
        this.y *= num
        this.z *= num
        return this
    }

    divide(num:number){
        this.x /= num
        this.y /= num
        this.z /= num
        return this
    }

    angleWith(vector: Vector3){
        return Math.acos(this.dotWith(vector) / (this.magnitude() * vector.magnitude())) * (180/Math.PI)
    }

    dotWith(vector: Vector3){
        return this.x * vector.x + this.y * vector.y + this.z * vector.z 
    }

    magnitude(){
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2))
    }

    normalize(){
        let newVector: Vector3 = Vector3.fromV3(this)
        return newVector.divide(newVector.magnitude())
    }

    add(vector: Vector3){
        let newVector = new Vector3(this.x, this.y, this.z)
        newVector.x += vector.x
        newVector.y += vector.y
        newVector.z += vector.z
        return newVector
    }

    subtract(vector: Vector3){
        let newVector = new Vector3(this.x, this.y, this.z)
        newVector.x -= vector.x
        newVector.y -= vector.y
        newVector.z -= vector.z
        return newVector
    }
    toString(){
        return General.truncate(this.x, 2) + ", "+ General.truncate(this.y, 2) +", "+General.truncate(this.z, 2)
    }
}