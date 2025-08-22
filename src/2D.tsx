export class Vector2 {
    x: number;
    y: number;

    constructor(x : number, y : number){
        this.x = x
        this.y = y
    }
}

export class Color {
    r: number
    g: number
    b: number
    a: number

    constructor(r:number,g:number,b:number,a:number=1){
        this.r = r
        this.g = g
        this.b = b
        this.a = a
    }

    toHex(){
        let str: string = '#'
        str += this._toTwoHex(this.r)
        str += this._toTwoHex(this.g)
        str += this._toTwoHex(this.b)
        str += this._toTwoHex(this.a*255)
        
        return str
    }

    _toTwoHex(num: number){
        let str = num.toString(16)
        if(str.length == 1){
            str = "0" + str
        }
        return str
    }

    rgbaString(){
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`
    }

    static fromHex(hex:string){
        if(hex.startsWith('#')){
            hex = hex.slice(1, hex.length)
        }
        if(hex.length != 6 && hex.length != 8){
            return new Color(-1, -1, -1, -1)
        }
        let r,g,b,a : number
        a = 1

        try{
            let strr: string = hex.slice(0, 2)
            let strg: string = hex.slice(2, 4)
            let strb: string = hex.slice(4, 6)


            r = parseInt(hex.slice(0, 2), 16)
            g = parseInt(hex.slice(2, 4), 16)
            b = parseInt(hex.slice(4, 6), 16)
            if(hex.length == 8){
                a =  parseInt(hex.slice(6, 8), 16)/255
            }

            return new Color(r, g, b, a)
        }
        catch{
            return new Color(-1, -1, -1, -1)
        }
    }
    
}