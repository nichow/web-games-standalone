import { Enemy } from './Enemy';

export class Mook extends Enemy {
    public readonly color: string = 'red';

    private async wander() {
        while (this.isAlive) {
            await this.chooseDirection();
        }
    }

    private async chooseDirection() {
        let direction: number = Math.floor(Math.random() * 5);
        switch(direction) {
            case 0: {
                this.left = true;
                this.right = false;
                this.up = false;
                this.down = false;
                break;
            }
            case 1: {
                this.left = false;
                this.right = true;
                this.up = false;
                this.down = false;
                break;
            }
            case 2: {
                this.left = false;
                this.right = false;
                this.up = true;
                this.down = false;
                break;
            }
            case 3: {
                this.left = false;
                this.right = false;
                this.up = false;
                this.down = true;
                break;
            }
        }
        // ms 
        let ms: number = Math.floor(100 + Math.random() * 750);
        await this.waitfor(ms);
    }

    constructor(x: number, y: number) {
        super();
        this.x = x;
        this.y = y;
        this.w = 10;
        this.h = 15;
        this.v = 1;
        this.score = 100;
        this.wander();
    }
}