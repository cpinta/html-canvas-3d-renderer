import { Vector2 } from "./2D"

export class InputManager {
    keys: Set<string> = new Set()
    key2eventMap: Map<string, string> = new Map<string, string>()
    mouseButtons: Set<number> = new Set()

    useMouse: boolean = false
    mouseX: number = 0
    mouseY: number = 0
    mouseDX: number = 0
    mouseDY: number = 0
    mouseWheelDelta: number = 0

    MOUSE_KEY_SPEED: number = 100

    moveVector: Vector2 = new Vector2()
    mouseDiffVector: Vector2 = new Vector2()

    keyMoveForward: string = "KeyW"
    keyMoveBack: string = "KeyS"
    keyMoveLeft: string = "KeyA"
    keyMoveRight: string = "KeyD"

    keyLookForward: string = "ArrowUp"
    keyLookBack: string = "ArrowDown"
    keyLookLeft: string = "ArrowLeft"
    keyLookRight: string = "ArrowRight"

    keyEscape: string = "Escape"

    keyOpenFilePicker: string = "KeyF"

    static strELockMouse = 'lockMouse'
    static strEOpenFilePicker = 'openFilePicker'
    static strEMoveMouseKeysPressed = 'moveMouseKeysPressed'

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
            console.log(e.code)
            this.addKey(e.code)
        })

        window.addEventListener('keyup', (e) => {
            this.removeKey(e.code)
        })

        window.addEventListener('mousedown', (e) => {
            this.mouseButtons.add(e.button)
            if(!document.pointerLockElement){
                document.dispatchEvent(new Event('lockMouse'))
                this.useMouse = true
            }
        })

        window.addEventListener('mouseup', (e) => {
            this.mouseButtons.delete(e.button)
        })

        window.addEventListener('mousemove', (e) => {
            if(!this.useMouse){
                return;
            }
            this.mouseDX = e.movementX
            this.mouseDY = e.movementY
            this.mouseX = e.clientX
            this.mouseY = e.clientY

            this.mouseDiffVector.x += this.mouseDX
            this.mouseDiffVector.y += this.mouseDY
        })

        window.addEventListener('wheel', (e) => {
            this.mouseWheelDelta = e.deltaY
        })

        this.key2eventMap.set(this.keyOpenFilePicker, 'openFilePicker')
    }

    addKey(code: string){
        this.keys.add(code)
        if(code === this.keyMoveForward || code === this.keyMoveBack || code === this.keyMoveLeft || code === this.keyMoveRight){
            this.updateMoveInput(code)
        }
        else{
            if(this.key2eventMap.has(code)){
                document.dispatchEvent(new Event(this.key2eventMap.get(code)!))
            }
        }
        if(code === this.keyLookForward || code === this.keyLookBack || code === this.keyLookLeft || code === this.keyLookRight){
            this.updateMouseKeyInput(code)
        }
    }
    removeKey(code: string){
        this.keys.delete(code)
        if(code === this.keyMoveForward || code === this.keyMoveBack || code === this.keyMoveLeft || code === this.keyMoveRight){
            this.updateMoveInput(code)
        }
        
        if(code === this.keyLookForward || code === this.keyLookBack || code === this.keyLookLeft || code === this.keyLookRight){
            this.updateMouseKeyInput(code)
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
        this.mouseDiffVector.setZero()
        return vector
    }

    updateMoveInput(input: string){
        let isPressed: boolean = false
        if(this.keys.has(input)){
            isPressed = true
        }
        switch(input){
            case this.keyMoveForward:
                this.moveVectorOpposingKeys(this.keyMoveBack, 1, isPressed, false, this.moveVector)
                break
            case this.keyMoveBack:
                this.moveVectorOpposingKeys(this.keyMoveForward, -1, isPressed, false, this.moveVector)
                break
            case this.keyMoveLeft:
                this.moveVectorOpposingKeys(this.keyMoveRight, -1, isPressed, true, this.moveVector)
                break
            case this.keyMoveRight:
                this.moveVectorOpposingKeys(this.keyMoveLeft, 1, isPressed, true, this.moveVector)
                break
        }
    }

    updateMouseKeyInput(input: string){
        let isPressed: boolean = false
        if(this.keys.has(input)){
            isPressed = true
        }
        switch(input){
            case this.keyLookForward:
                this.moveVectorOpposingKeys(this.keyLookBack, 1, isPressed, false, this.mouseDiffVector)
                break
            case this.keyLookBack:
                this.moveVectorOpposingKeys(this.keyLookForward, -1, isPressed, false, this.mouseDiffVector)
                break
            case this.keyLookLeft:
                this.moveVectorOpposingKeys(this.keyLookRight, -1, isPressed, true, this.mouseDiffVector)
                break
            case this.keyLookRight:
                this.moveVectorOpposingKeys(this.keyLookLeft, 1, isPressed, true, this.mouseDiffVector)
                break
        }
        this.mouseDiffVector.multiply(this.MOUSE_KEY_SPEED)
        document.dispatchEvent(new Event(InputManager.strEMoveMouseKeysPressed))
    }

    moveVectorOpposingKeys(oppKey: string, curNum: number, isPressed: boolean, isX: boolean, curVector: Vector2){
        if(isPressed){
            if(isX){
                curVector.x = curNum
            }
            else{
                curVector.y = curNum
            }
            if(this.isKeyPressed(oppKey)){
                if(isX){
                    curVector.x = 0
                }
                else{
                    curVector.y = 0
                }
            }
        }
        else{
            if(isX){
                curVector.x = 0
            }
            else{
                curVector.y = 0
            }
            if(this.isKeyPressed(oppKey)){
                if(isX){
                    curVector.x = -curNum
                }
                else{
                    curVector.y = -curNum
                }
            }
        }
    }

    endFrame(){
        this.mouseDX = 0
        this.mouseDY = 0
        this.mouseWheelDelta = 0
    }

}