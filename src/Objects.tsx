import { Vector2 } from "./2D"
import { Billboard, Camera, Object3D, Vector3 } from "./3D"
import { Game } from "./Game"

export class MouseInteractableObject extends Object3D{
    
    mouseIsHovering: boolean = false
    _oldMouseIsHovering: boolean = false

    tick(deltaTime:number){
        super.tick(deltaTime)
    }

    eventMouseHover(){

    }
    eventMouseBeganHover(){
        this.mouseIsHovering = true
    }
    eventMouseEndHover(){
        this.mouseIsHovering = false
    }

    eventMouseClick(){

    }
}

export class HoveringObject extends MouseInteractableObject{
    MAX_HOVER_SCALE: number = 1.1
    SCALE_SPEED: number = 1
    
    tick(deltaTime:number){
        super.tick(deltaTime)
        if(this.mouseIsHovering){
            // this.setLScale(Vector3.one().multiply(2))
            if(this.getLScale().y < this.MAX_HOVER_SCALE){
                this.scaleL(Vector3.one().multiply(this.SCALE_SPEED*deltaTime))
                // this.RotateL(new Vector3(0, 3, 0).multiply(deltaTime))
            }
            else{
                // this.setLScale(Vector3.one().multiply(this.MAX_HOVER_SCALE))
            }
        }
        else{
            if(this.getLScale().y > 1){
                this.scaleL(Vector3.one().multiply(-this.SCALE_SPEED*deltaTime))
            }
            else{
                this.setLScale(Vector3.one())
            }
        }
    }

    eventMouseEndHover(){
        super.eventMouseEndHover()
        // this.setLScale(Vector3.one())
    }
}

export class CloudBillboard extends Billboard {
    tick(deltaTime: number){
        this.moveWPosition(new Vector3(0,0,1).multiply(deltaTime))
    }
}