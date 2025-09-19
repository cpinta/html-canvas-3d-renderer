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

    static scale(matrix: number[][], offset: Vector3){
        let idMatrix = structuredClone(identityMatrix4)
        idMatrix[0][0] = offset.x;
        idMatrix[1][1] = offset.y;
        idMatrix[2][2] = offset.z;
        // idMatrix[3][3] = 1;
        return MMath.addsub(matrix, idMatrix, true);
    }
    
    static setScale(matrix: number[][], offset: Vector3){
        matrix[0][0] = offset.x;
        matrix[1][1] = offset.y;
        matrix[2][2] = offset.z;
        // matrix[3][3] = 1;
        return matrix
    }

    static setPosition(matrix: number[][], position: Vector3){
        matrix[0][3] = position.x;
        matrix[1][3] = position.y;
        matrix[2][3] = position.z;
        matrix[3][3] = 1;
        return matrix
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

    static multiplyScalar(matrix: number[][], scalar: number){
        let newMat: number[][] =[]
        for(let i=0;i<matrix.length;i++){
            newMat[i] = []
            for(let j=0;j<matrix[0].length;j++){
                newMat[i][j] = matrix[i][j] * scalar
            }
        }
        return newMat
    }

    // static determinant(matrix: number[][]){
    //     let i=0;
    //     let sum = 0;
    //     while(i < matrix[0].length){
    //         if(matrix.length > 2){
    //             this.determinant
    //         }

    //         if(i % 2 == 0){
    //             sum += 
    //         }
    //         else{

    //         }
            
    //         i++;
    //     }
    // }

    static det(matrix: number[][]){
        let sum = 0
        for(let i=0;i<matrix[0].length;i++){
            let arr: number[] = []
            for(let k=0;k<matrix[0].length;k++){
                if(k==i){
                    continue;
                }
                for(let j=1;j<matrix.length;j++){
                    arr.push(matrix[j][k])
                }
            }
            let subDet = 0
            if(arr.length == 4){
                subDet = this.det2arr(arr)
            }
            else{
                subDet = this.detArr(arr)
            }
            let erm = (i % 2 == 0? 1 : -1) * subDet
            let uh = matrix[0][i]
            sum += matrix[0][i] * (i % 2 == 0? 1 : -1) * subDet
        }
        return sum
    }

    static detArr(matArr: number[]){
        let sum = 0
        let sideLen = Math.sqrt(matArr.length)
        for(let i=0;i<sideLen;i++){
            let arr: number[] = []
            for(let k=0;k<sideLen;k++){
                if(k==i){
                    continue;
                }
                for(let j=1;j<sideLen;j++){
                    arr.push(matArr[(k * sideLen) + j])
                }
            }
            let subDet = 0
            if(arr.length == 4){
                subDet = this.det2arr(arr)
            }
            else{
                subDet = this.detArr(arr)
            }
            let erm = (i % 2 == 0? 1 : -1) * subDet
            let uh = matArr[i*sideLen]
            sum += matArr[i*sideLen] * (i % 2 == 0? 1 : -1) * subDet
        }
        return sum
    }

    static det2(matrix: number[][]){
        return (matrix[0][0] * matrix[1][1]) - (matrix[0][1] * matrix[1][0])
    }
    static det2arr(arr: number[]){
        return (arr[0] * arr[3]) - (arr[1] * arr[2])
    }

    static invert(matrix: number[][]){
    }

    static toVector3(matrix: number[][]){
        return new Vector3(matrix[0][0], matrix[1][0], matrix[2][0])
    }

    //putting this in here cause no where else to put it???
    static getHypotenuse(leg1: number, leg2: number){
        return Math.pow(leg1, 2) + Math.pow(leg2, 2)
    }

    static getTransposeMatrix(matrix: number[][]){
        let newMatrix = structuredClone(matrix)
        let col = 1;
        let row = 0;
        while(row < newMatrix.length - 1){
            let lowerVal = newMatrix[row][col]
            newMatrix[row][col] = newMatrix[col][row]
            newMatrix[col][row] = lowerVal
            col++
            if(col >= newMatrix[row].length){
                row++
                col = row+1
            }
        }
        return newMatrix
    }

    static getAdj(matrix: number[][]){
        let sum = 0
        let newMatrix: number[][] = []
        let stopRow: number = 0
        let stopCol: number = 0
        let row: number = 1
        let col: number = 1
        while(row < matrix.length){
            // newMatrix[row] = [
        }
        return sum
    }
    
    static addsub(mat1:number[][], mat2:number[][], isAddition: boolean){
        let newMat: number[][] =[]
        for(let i=0;i<mat1.length;i++){
            newMat[i] = []
            for(let j=0;j<mat1[0].length;j++){
                if(isAddition){
                    newMat[i][j] = mat1[i][j] + mat2[i][j]
                }
                else{
                    newMat[i][j] = mat1[i][j] - mat2[i][j]
                }
            }
        }
        return newMat
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