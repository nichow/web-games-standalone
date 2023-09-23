import { Actor } from '../Actor';
import { Player } from '../Player';

export class Enemy extends Actor {
    protected score: number = 0;

    public collide(player: Player) {
        if (this.coll(player)) {
            player.kill();
        }
    }
    
    public getScore() {
        return this.score;
    }

    constructor() {
        super();
    }
}