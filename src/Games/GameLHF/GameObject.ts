export class GameObject {
    protected alive: boolean = false;

    protected x: number = 0;
    protected y: number = 0;
    protected w: number = 0;
    protected h: number = 0;
    protected v: number = 0;

    public left:  boolean = false;
    public right: boolean = false;
    public up:    boolean = false;
    public down:  boolean = false;

    public color: string = 'black';

    protected setPos(pos: [number, number]): void {
        let x: number = pos[0];
        let y: number = pos[1];
        x = x < 30 ? 30 : x;
        x = x > 610 - this.w ? 610 - this.w : x;
        y = y < 30 ? 30 : y;
        y = y > 450 - this.h ? 450 - this.h : y;
        this.x = x;
        this.y = y;
    }

    protected kill(): void {
        this.alive = false;
    }

    protected coll(tgt: GameObject): boolean {
        let [_tx, _ty]: [number, number] = tgt.getPos();
        let [_tw, _th]: [number, number] = tgt.getSize();
        let [x, xw, y, yh] = [this.x, this.x + this.w, this.y, this.y + this.h]
        let [tx, txw, ty, tyh] = [_tx, _tx + _tw, _ty, _ty + _th];
        let collX: boolean = (x <= txw && xw >= tx) || (tx >= txw && xw <= tx)
        if (!collX)
            return false;
        let collY: boolean = (y <= tyh && yh >= ty) || (y >= tyh && yh <= ty)
        return collY;
    }

    public move(): void {
        let newX: number = this.x;
        let newY: number = this.y;
        if (this.left) {
            newX -= this.v;
        }
        if (this.right) {
            newX += this.v;
        }
        if (this.up) {
            newY -= this.v;
        }
        if (this.down) {
            newY += this.v;
        }
        this.setPos([newX, newY]);
    }

    public getPos(): [number, number] {
        return [this.x, this.y];
    }

    public getSize(): [number, number] {
        return [this.w, this.h];
    }
    
    public isAlive(): boolean {
        return this.alive;
    }

    constructor() {
        this.alive = true;
    }
}