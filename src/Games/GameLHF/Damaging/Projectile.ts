import { GameObject } from '../GameObject';

export class Projectile extends GameObject {
    protected damage: number = 0;

    public move(): void {
        super.move();
        if (this.x == 606 || this.y == 446 || this.x == 30 || this.y == 30)
            this.kill();
    }

    constructor(x: number, y: number, l: boolean, r: boolean, u: boolean, d: boolean) {
        super();
        this.setPos([x, y])
        this.w = 4;
        this.h = 4;
        this.v = 4;

        this.right = r;
        this.left = l;
        this.down = d;
        this.up = u;
    }
}