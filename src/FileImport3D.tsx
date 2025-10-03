import { Color } from "./2D"
import { Face, Mesh, Object3D, Vector3 } from "./3D"

class FileImport3D{
    static OBJ_Import(fileContent: string, color: Color){
        let objName: string = ""
        let objs: Object3D[] = []
        let verts: Vector3[] = []
        let faces: number[][] = []
        let facesObjs: Face[] = []
        let vertNormals: Vector3[] = []
        let currentColor: Color = Color.hotPink

        let list: string[] = []
        if(fileContent.includes("\r\n")){
            list = fileContent.split("\r\n")
        }
        else{
            list = fileContent.split("\n")
        }

        for(let i=0;i<list.length;i++){
            let args: string[] = list[i].split(" ")
            switch(args[0]){
                case "o":
                    if (objName != ""){
                        let mesh = new Mesh(verts, facesObjs)
                        objs.push(new Object3D(mesh, objName))
                    }
                    objName = args[1]
                    faces = []
                    facesObjs = []
                    break
                case "v":
                    verts.push(new Vector3(-Number.parseFloat(args[1]), Number.parseFloat(args[2]), Number.parseFloat(args[3])))
                    break
                case "vn":
                    vertNormals.push(new Vector3(-Number.parseFloat(args[1]), Number.parseFloat(args[2]), Number.parseFloat(args[3])))
                    break
                case "f":
                    let face: number[] = []
                    let vn: number[] = []
                    for(let j=1;j<args.length;j++){
                        let vertInds: string[] = args[j].split("/")
                        face.push(Number.parseInt(vertInds[0]) - 1)
                        vn.push(Number.parseInt(vertInds[2]) - 1)
                    }
                    try{
                        if(vertNormals.length > vn[0]){
                            facesObjs.push(new Face(face, currentColor, new Vector3(vertNormals[vn[0]].x, vertNormals[vn[0]].y, vertNormals[vn[0]].z)))
                        }
                        else{
                            facesObjs.push(new Face(face, currentColor))
                        }
                    }
                    catch(ex: any){
                        console.log("bruh")
                    }
                    break
                case "#":
                    break
                case "usemtl":
                    let curMatName: string = args[1]
                    if(Color.matColors.has(curMatName)){
                        currentColor = Color.fromColor(Color.matColors.get(curMatName)!)
                    }
                    else{
                        let temp = 0
                    }
                    break
                default:
                    break
            }
        }

        let mesh = new Mesh(verts, facesObjs)
        let obj = new Object3D(mesh, objName)
        objs.push(obj)
        return objs
    }
    
    static async ImportIsland(){
        const response = await fetch('/3d renderer island.obj');
        const islandContent = await response.text();
        return FileImport3D.OBJ_Import(islandContent, Color.hotPink)
    }

    static async Image_Import(filePath: string, sx: number = 0, sy: number = 0, sWidth: number = -1, sHeight: number = -1){
        const response = await fetch(filePath);
        const blob = await response.blob()
        const bitmap = await createImageBitmap(blob)

        return bitmap
    }

    static async ImportImage(path: string){
        return FileImport3D.Image_Import(path)
    }
}


export default FileImport3D