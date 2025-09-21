import { Color, Vector2 } from "./2D"
import { Billboard, Object3D } from "./3D"
import FileImport3D from "./FileImport3D"
import { InputManager } from "./InputManager"
import { FrameInfo, Renderer } from "./Renderer"
import { HoveringObject, MouseInteractableObject } from "./Objects"

export class Game{
    static instance: Game
    renderer: Renderer
    input: InputManager
    deltaTime: number = 0

    frameCount: number = 0
    fps: number = 0
    UPDATE_FPS_EVERY: number = 20

    objects: Object3D[] = []
    objectMap: Map<string, number> = new Map()
    
    moveVelocity = 10
    mouseSensitivity = 0.0025

    camRotationSpeed: Vector2 = new Vector2(0.1, 0.1) 
    objectRotationSpeed: Vector2 = new Vector2(1, 0.1) 

    constructor(){
        this.renderer = new Renderer()
        this.input = new InputManager()
        
        if(Game.instance != null){
            Game.instance = this
        }
    }

    async init(ctx: CanvasRenderingContext2D, scaleMultiplier: number){
        this.renderer.renderDimensions = new Vector2(ctx.canvas.width, ctx.canvas.height)
        this.renderer.screenDimensions = new Vector2(window.innerWidth, window.innerHeight)
        this.renderer.scaleMultiplier = scaleMultiplier

        const islandObjs: Object3D[] = await FileImport3D.ImportIsland();
        const bmpCloud: ImageBitmap = await FileImport3D.ImportCloudPNG()
        if(this.objects.length == 0){
            for(let i=0;i<islandObjs.length;i++){
                this.addObject(new HoveringObject(islandObjs[i].mesh, islandObjs[i].name))
            }
            let cloud = new Billboard(bmpCloud, "cloud")
            this.addObject(cloud)
        }


    }

    addObject(obj: Object3D){
        let ind: number = 1
        let ogName: string = obj.name
        while(this.objectMap.has(obj.name)){
            obj.name = ogName + ind
            ind++
        }
        this.objectMap.set(obj.name, this.objects.length)
        this.objects.push(obj)
    }
    
    prevObj: MouseInteractableObject | null = null

    tick(ctx: CanvasRenderingContext2D, deltaTime: number){
        let mouseVec: Vector2 = this.input.mouseVector
        
        this.renderer.camera.resetRotation()
        this.renderer.camera.camRotate(new Vector2((mouseVec.x/window.innerWidth-0.5)*this.camRotationSpeed.x, (mouseVec.y/window.innerHeight-0.5)*this.camRotationSpeed.y))

        this.renderer.mousePosition = mouseVec;

        this.renderer.clear(ctx)
        this.renderer.draw({ctx:ctx, deltaTime: 0, frameCount: this.frameCount}, this.objects)
        if(this.prevFrameInfo().mouseHoverPosTriIndex != -1){
            this.renderer.drawPolygon(ctx, this.prevFrameInfo().worldScreenSpaceVerts, this.prevFrameInfo().screenSpaceFaces[this.prevFrameInfo().mouseHoverPosTriIndex], false, false, false, Color.white)
            let curObj: Object3D = this.prevFrameInfo().screenSpaceFaces[this.prevFrameInfo().mouseHoverPosTriIndex].face.mesh.obj!
            if(curObj instanceof MouseInteractableObject){
                if(this.prevObj != curObj){
                    if(this.prevObj){
                        this.prevObj.eventMouseEndHover()
                    }
                    curObj.eventMouseBeganHover()
                }
                curObj.eventMouseHover()
                this.prevObj = curObj
            }
            else{
                if(this.prevObj){
                    this.prevObj.eventMouseEndHover()
                    this.prevObj = null
                }
            }
        }
        else{
            if(this.prevObj){
                this.prevObj.eventMouseEndHover()
                this.prevObj = null
            }
        }

        for(let i=0;i<this.objects.length;i++){
            this.objects[i].tick(deltaTime)
        }
        
        ctx.fillText(this.fps.toString(), 20, 100)
        ctx.fillText(mouseVec.x.toString()+", "+mouseVec.y.toString(), 20, 200)
        ctx.fillText(window.innerWidth.toString()+", "+window.innerHeight.toString(), 20, 220)
        ctx.fillText((Math.trunc((mouseVec.x/window.innerWidth-0.5)*100)/100).toString()+", "+(Math.trunc((mouseVec.y/window.innerHeight-0.5)*100)/100).toString(), 20, 240)
        
        if(this.frameCount % this.UPDATE_FPS_EVERY == 0){
            this.fps = Math.trunc(1/deltaTime)
        }
    }


    prevFrameInfo(): FrameInfo {
        return this.renderer.fi
    }
}