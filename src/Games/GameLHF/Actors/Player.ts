import { Actor } from './Actor'
import { Bullet } from '../Damaging/Bullet';

export class Player extends Actor {
    public color: string = 'white';
    public bullets: Array<Bullet> = [];
    public halt: boolean = false;
    private invuln: boolean = false;
    private readonly recoilTime: number = 150;
    
    public async fire() {
        const firing: boolean = this.fleft || this.fright || this.fdown || this.fup;
        if (firing && !this.recoiling && this.alive) {
            this.bullets.push(new Bullet(this.x, this.y, this.fleft, this.fright, this.fup, this.fdown));
            this.recoiling = true;
            await this.waitfor(this.recoilTime);
            this.recoiling = false;
        }
    }

    private async blink(times: number, between: number, secondBetween?: number) {
        if (!secondBetween)
            secondBetween = between;
        for (let i: number = 0; i < times; i++) {
            this.color = 'black';
            await this.waitfor(between);
            this.color = 'white';
            await this.waitfor(secondBetween);
        }
    }

    public kill() {
        if (!this.invuln)
            super.kill();
            this.halt = true;
            this.invuln = true;
    }

    public async revive() {
        await this.blink(4, 500);
        this.setPos([240, 240]);
        await this.blink(4, 300);
        this.alive = true;
        this.halt = false;
        await this.blink(2, 200, 300);
        this.invuln = false;
    }

    constructor() {
        super();
        this.x = 320;
        this.y = 240;
        this.w = 10;
        this.h = 10;
        this.v = 2;
        this.setPos([this.x, this.y]);
    }
}