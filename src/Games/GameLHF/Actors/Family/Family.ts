import { Actor } from "../Actor";
import { Player } from "../Player";
import { Thing } from "../Enemies/Thing";

export class Family extends Actor {
    protected score: number = 1000;

    public collide(a:Actor) {
        if (this.coll(a)) {
            if (a instanceof Player) {
                window.dispatchEvent(new CustomEvent('collision', {
                    detail: { source: a, target: this }
                }))
                this.alive = false;
            } else if (a instanceof Thing) {
                this.kill();
            }
        }
    }

    public getScore() {
        return this.score;
    }
}