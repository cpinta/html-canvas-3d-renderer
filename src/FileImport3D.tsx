import { Color } from "./2D"
import { Face, Mesh, Object3D, Vector3 } from "./3D"

class FileImport3D{
    static OBJ_Import(fileContent: string, color: Color){
        let objName: string = ""
        let verts: Vector3[] = []
        let faces: number[][] = []
        let facesObjs: Face[] = []
        let vertNormals: Vector3[] = []

        let list: string[] = fileContent.split("\n")
        for(let i=0;i<list.length;i++){
            let args: string[] = list[i].split(" ")
            switch(args[0]){
                case "o":
                    objName = args[1]
                    break
                case "v":
                    verts.push(new Vector3(Number.parseFloat(args[1]), Number.parseFloat(args[2]), Number.parseFloat(args[3])))
                    break
                case "vn":
                    vertNormals.push(new Vector3(Number.parseFloat(args[1]), Number.parseFloat(args[2]), Number.parseFloat(args[3])))
                    break
                case "f":
                    let face: number[] = []
                    let vn: number[] = []
                    for(let j=1;j<args.length;j++){
                        let vertInds: string[] = args[j].split("/")
                        face.push(Number.parseInt(vertInds[0]) - 1)
                        vn.push(Number.parseInt(vertInds[2]) - 1)
                    }
                    faces.push(face)
                    facesObjs.push(new Face(face, color, new Vector3(vn[0], vn[1], vn[2])))
                    break
                case "#":
                    break
                default:
                    break
            }
        }

        let mesh = new Mesh(verts, facesObjs)
        let obj = new Object3D(mesh, objName)
        return obj
    }

    static GITF_Import(fileContent: string){

    }
}

export default FileImport3D