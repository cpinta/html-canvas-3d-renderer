import { Vector3 } from "./3D"

export class MMath {

    static Rx(theta: number): number[][]{
        return [
            [1,0,0,0],
            [0, Math.cos(theta), -Math.sin(theta),0],
            [0, Math.sin(theta), Math.cos(theta),0],
            [0,0,0,1]
        ]
    }
    static Ry(theta: number): number[][]{
        return [
            [Math.cos(theta),0,Math.sin(theta),0],
            [0, 1, 0,0],
            [-Math.sin(theta), 0, Math.cos(theta),0],
            [0,0,0,1]

        ]
    }
    static Rz(theta: number): number[][]{
        return [
            [Math.cos(theta),-Math.sin(theta),0,0],
            [Math.sin(theta), Math.cos(theta),0,0],
            [0, 0, 1,0],
            [0,0,0,1]
        ]
    }

    static rotate(matrix: number[][], rotation: Vector3){
        return this.multiply(matrix, this.multiply(this.Rx(rotation.x), this.multiply(this.Ry(rotation.y), this.Rz(rotation.z))))
    }

    static move(matrix: number[][], offset: Vector3){
        let idMatrix = structuredClone(identityMatrix4)
        idMatrix[0][3] = offset.x;
        idMatrix[1][3] = offset.y;
        idMatrix[2][3] = offset.z;
        idMatrix[3][3] = 1;
        return MMath.multiply(matrix, idMatrix);
    }

    static multiply(mat1: number[][], mat2: number[][]){
        if(mat1[0].length != mat2.length){
            if(mat2[0].length != mat1.length){
                return []
            }
        }


        let newMat: number[][] = []
        for(let i=0;i<mat1.length;i++){
            newMat[i] = []
        }

        let i=0;
        let j=0;
        let iterate = 0;
        while(i < mat1.length){
            if(iterate < mat1.length){
                let add = mat1[i][iterate] * mat2[iterate][j]  
                if(newMat[i][j]){
                    newMat[i][j] += add
                }
                else{
                    newMat[i][j] = add
                }
                iterate++
            }
            else{
                j++
                if(j > mat1[0].length-1 || j > mat2[0].length-1){
                    j = 0
                    i++
                }
                iterate = 0
            }
        }
        return newMat
    }

    static toVector3(matrix: number[][]){
        return new Vector3(matrix[0][0], matrix[1][0], matrix[2][0])
    }

    //putting this in here cause no where else to put it???
    static getHypotenuse(leg1: number, leg2: number){
        return Math.pow(leg1, 2) + Math.pow(leg2, 2)
    }
}

export const identityMatrix3 : number[][] = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
]

export const identityMatrix4 : number[][] = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
]