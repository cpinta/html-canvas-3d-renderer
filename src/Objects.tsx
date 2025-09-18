import { Object3D, Vector3 } from "./3D"

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
    MAX_HOVER_SCALE: number = 0.5
    
    tick(deltaTime:number){
        super.tick(deltaTime)
        if(this.mouseIsHovering){
            if(this.getLPosition().y < this.MAX_HOVER_SCALE){
                this.moveLPosition(new Vector3(0,1*deltaTime, 0))
            }
            else{
                this.setLPosition(new Vector3(0,this.MAX_HOVER_SCALE, 0))
            }
        }
    }

    eventMouseEndHover(){
        super.eventMouseEndHover()
        this.setLPosition(new Vector3(0, 0, 0))
    }
}