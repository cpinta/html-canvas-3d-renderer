import { Vector2 } from "./2D"

export class InputManager {
    keys: Set<string> = new Set()
    mouseButtons: Set<number> = new Set()
    mouseX: number = 0
    mouseY: number = 0
    mouseDX: number = 0
    mouseDY: number = 0
    mouseWheelDelta: number = 0

    moveVector: Vector2 = new Vector2()
    mouseDiffVector: Vector2 = new Vector2()

    keyMoveForward: string = "KeyW"
    keyMoveBack: string = "KeyS"
    keyMoveLeft: string = "KeyA"
    keyMoveRight: string = "KeyD"
    keyEscape: string = "Escape"

    eventLockMouse = new Event('lockMouse')

    // switch (e.code){
    //         case 'KeyF':
    //             if(!fileRef.current){
    //                 return
    //             }
    //             let file : HTMLInputElement = fileRef.current
    //             file.click()
    //             break
    //         case 'Space':
    //             renderer.current.camera.wMovePosition(new Vector3(0, 1, 0))
    //             break
    //         case 'ShiftLeft':
    //             renderer.current.camera.wMovePosition(new Vector3(0, -1, 0))
    //             break
    //         case 'KeyW':
    //             renderer.current.camera.wMovePosition(new Vector3(0, 0, 0.5))
    //             break
    //         case 'KeyS':
    //             renderer.current.camera.wMovePosition(new Vector3(0, 0, -0.5))
    //             break
    //         case 'KeyA':
    //             renderer.current.camera.wMovePosition(new Vector3(-1, 0, 0))
    //             break
    //         case 'KeyD':
    //             renderer.current.camera.wMovePosition(new Vector3(1, 0, 0))
    //             break
    //         case 'ArrowLeft':
    //             renderer.current.camera.wRotate(new Vector3(0, -0.03, 0))
    //             break
    //         case 'ArrowRight':
    //             renderer.current.camera.wRotate(new Vector3(0, 0.03, 0))
    //             break
    //     }

    constructor(){
        window.addEventListener('keydown', (e) => {
            this.addKey(e.code)
        })

        window.addEventListener('keyup', (e) => {
            this.removeKey(e.code)
        })

        window.addEventListener('mousedown', (e) => {
            this.mouseButtons.add(e.button)
            if(!document.pointerLockElement){
                // this.eventLockMouse.
            }
        })

        window.addEventListener('mouseup', (e) => {
            this.mouseButtons.delete(e.button)
        })

        window.addEventListener('mousemove', (e) => {
            this.mouseDX = e.movementX
            this.mouseDY = e.movementY
            this.mouseX = e.clientX
            this.mouseY = e.clientY

            console.log('moved mouse: '+ this.mouseDX + ', '+this.mouseDY)

            this.mouseDiffVector.x += this.mouseDX
            this.mouseDiffVector.y += this.mouseDY
        })

        window.addEventListener('wheel', (e) => {
            this.mouseWheelDelta = e.deltaY
        })
    }

    addKey(code: string){
        this.keys.add(code)
        if(code == this.keyMoveForward || code == this.keyMoveBack || code == this.keyMoveLeft || code == this.keyMoveRight){
            this.updateMoveInput(code)
        }

    }
    removeKey(code: string){
        this.keys.delete(code)
        if(code == this.keyMoveForward || code == this.keyMoveBack || code == this.keyMoveLeft || code == this.keyMoveRight){
            this.updateMoveInput(code)
        }
        // else if(code == this.keyEscape){
        //     document.
        // }
    }

    isKeyPressed(code: string){
        return this.keys.has(code)
    }

    getMouseVector(){
        let vector = structuredClone(this.mouseDiffVector)
        this.mouseDiffVector.zero()
        return vector
    }

    updateMoveInput(input: string){
        let isPressed: boolean = false
        if(this.keys.has(input)){
            isPressed = true
        }
        switch(input){
            case this.keyMoveForward:
                this.moveVectorOpposingKeys(this.keyMoveBack, 1, isPressed, false)
                break
            case this.keyMoveBack:
                this.moveVectorOpposingKeys(this.keyMoveForward, -1, isPressed, false)
                break
            case this.keyMoveLeft:
                this.moveVectorOpposingKeys(this.keyMoveRight, -1, isPressed, true)
                break
            case this.keyMoveRight:
                this.moveVectorOpposingKeys(this.keyMoveLeft, 1, isPressed, true)
                break
        }
    }

    moveVectorOpposingKeys(oppKey: string, curNum: number, isPressed: boolean, isX: boolean){
        if(isPressed){
            if(isX){
                this.moveVector.x = curNum
            }
            else{
                this.moveVector.y = curNum
            }
            if(this.isKeyPressed(oppKey)){
                if(isX){
                    this.moveVector.x = 0
                }
                else{
                    this.moveVector.y = 0
                }
            }
        }
        else{
            if(isX){
                this.moveVector.x = 0
            }
            else{
                this.moveVector.y = 0
            }
            if(this.isKeyPressed(oppKey)){
                if(isX){
                    this.moveVector.x = -curNum
                }
                else{
                    this.moveVector.y = -curNum
                }
            }
        }
    }

    tick(){
        for (let key of Array.from(this.keys)) {

        }
    }

    endFrame(){
        this.mouseDX = 0
        this.mouseDY = 0
        this.mouseWheelDelta = 0
    }

}