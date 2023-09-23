import { Enemy } from './Enemy';
import { Player } from '../Player';

export class Thing extends Enemy {
    public readonly color: string = 'green';

    // can't be killed, can be slowed
    public async damage() {
        this.v = 0.125;
        await this.waitfor(1000);
        this.v = 0.25;
    }

    public hunt(pPos: [number, number]): void {
        if (pPos[0] < this.x) {
            this.left = true;
            this.right = false;
        } else if (pPos[0] > this.x) {
            this.right = true;
            this.left = false;
        } else {
            this.left = false;
            this.right = false;
        }
        if (pPos[1] > this.y) {
            this.down = true;
            this.up = false;
        } else if (pPos[1] < this.y) {
            this.up = true; 
            this.down = false;
        } else {
            this.up = false;
            this.down =false;
        }
    }

    constructor(x: number, y: number) {
        super();
        this.x = x; 
        this.y = y; 
        this.w = 20;
        this.h = 30;
        this.v = 0.25;
    }
}