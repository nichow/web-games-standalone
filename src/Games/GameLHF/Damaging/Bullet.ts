import { Projectile } from "./Projectile";
import { Enemy } from "../Actors/Enemies/Enemy";

export class Bullet extends Projectile {
    public readonly color: string = 'orange';

    public collide(enemies: Array<Enemy>) {
        enemies.map((enemy) => {
            if (this.coll(enemy)) {
                window.dispatchEvent(new CustomEvent("collision", {
                    detail: { source: this, target: enemy }
                }));
                this.kill();
            }
        });
    }

    constructor(x: number, y: number, l: boolean, r: boolean, u: boolean, d: boolean) {
        super(x,y,l,r,u,d);
        this.damage = 1;
    }
}