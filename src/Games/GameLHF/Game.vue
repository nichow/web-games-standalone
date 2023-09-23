<script lang="ts" setup>
import { onMounted } from 'vue';
import { Actor } from './Actors/Actor';
import { GameObject } from './GameObject';
import { Player }  from './Actors/Player';
import { Bullet } from './Damaging/Bullet'
import { Enemy } from './Actors/Enemies/Enemy';
import { Mook } from './Actors/Enemies/Mook';
import { Thing } from './Actors/Enemies/Thing';
import { Family } from './Actors/Family/Family';
import { Father } from './Actors/Family/Father';
import { Mother } from './Actors/Family/Mother';
import { Child } from './Actors/Family/Child';
import { type Level, mookLevel } from './Levels';

class View {
    public readonly WIDTH: number = 640;
    public readonly HEIGHT: number = 480;
}

class Controls {
    left:  string = 'a';
    right: string = 'd';
    up:    string = 'w';
    down:  string = 's';

    fleft:  string = 'ArrowLeft';
    fright: string = 'ArrowRight';
    fup:    string = 'ArrowUp';
    fdown:  string = 'ArrowDown';
}
/**
 * LHF is the game manager, it sets up and draws the canvas/context,
 * and contains the main update loop. Draws the BG, UI, and game objects;
 * sets up event handlers, and handles most game logic
 */
class LHF {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private static player: Player = new Player();
    private static controls: Controls = new Controls();
    private static view: View = new View();
    private static enemies: Array<Enemy> = [];
    private static things: Array<Thing> = [];
    private static family: Array<Family> = [];
    private static saved: number = 0;
    private static score: number = 0;
    private static lives: number = 5;
    private static scene: number = 0;
    private static selected: number = 0;
    private static readonly menuOptions: number = 2;

    /**
     * randPos generates an x,y coordinate not near the player's start position
     * used to generate start positions of NPCs
     * @returns tuple of 2 numbers: x and y coordinates
     */
    private static randPos(): [number, number] {
        let x: number, y: number;
        do {
            x = 35 + Math.floor(Math.random() * 600);
        } while (x >= 280 && x <= 360);
        do {
            y = 35 + Math.floor(Math.random() * 400);
        } while (y >= 200 && y <= 280);
        return [x, y]
    }

    /**
     * update the game's scene to given
     * @param scene scene being changed to
     */
    private static sceneChange(scene: number): void {
        LHF.scene = scene;
        LHF.saved = 0;
        let l: Level; 
        switch(scene % 5) {
            case 1: {
                l = mookLevel;
                break;
            }
            default: {
                l = mookLevel;
                break;
            }
        }
        let x: number, y: number;
        for (let i: number = 0; i < l.mook; i++) {
            [x, y] = LHF.randPos();
            LHF.enemies.push(new Mook(x, y));
        }
        for (let i: number = 0; i < l.thing; i++) {
            [x, y] = LHF.randPos();
            LHF.things.push(new Thing(x, y));
        }
        for (let i: number = 0; i < l.father; i++) {
            [x, y] = LHF.randPos()
            LHF.family.push(new Father(x, y));
        }
        for (let i: number = 0; i < l.mother; i++) {
            [x, y] = LHF.randPos()
            LHF.family.push(new Mother(x, y));
        }
        for (let i: number = 0; i < l.child; i++) {
            [x, y] = LHF.randPos()
            LHF.family.push(new Child(x, y));
        }
    }
    
    private static drawBG(ctx: CanvasRenderingContext2D): void {
        let v: View = LHF.view;
        ctx.fillStyle="black";
        ctx.fillRect(0, 0, v.WIDTH, v.HEIGHT);
        ctx.strokeStyle="red";
        ctx.strokeRect(20, 20, v.WIDTH - 40, v.HEIGHT - 40);
        ctx.strokeStyle="blue";
        ctx.strokeRect(25, 25, v.WIDTH - 50, v.HEIGHT - 50);
        ctx.strokeStyle="yellow";
        ctx.strokeRect(30, 30, v.WIDTH - 60, v.HEIGHT - 60);
    }

    private static drawUI(ctx: CanvasRenderingContext2D): void {
        let v: View = LHF.view;
        ctx.fillStyle="white";
        ctx.font = "bold 16px monospace"
        ctx.fillText("LAST HUMAN FAMILY", 15, 15);
        ctx.fillText(`SCORE: ${LHF.score}`, v.WIDTH - 130, 15);

        ctx.fillText(`WAVE: ${LHF.scene}`, 85, v.HEIGHT - 5);
        ctx.fillText('LIVES: ', 295, v.HEIGHT - 5);
        for (let i: number = 0; i < LHF.lives; ++i)
            ctx.fillRect(350 + i * 15, v.HEIGHT - 15, 10, 10);
    }

    private static drawMenu(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "white";
        ctx.font = "bold 48px monospace"
        ctx.fillText('LAST HUMAN FAMILY', 100, 175);

        ctx.font = "bold 24px monospace"
        ctx.fillText('START', 300, 275);
        ctx.fillText('OPTIONS', 300, 300);
        switch(LHF.selected) {
            case 0: {
                ctx.fillRect(275, 265, 5, 5);
                break;
            }
            case 1: {
                ctx.fillRect(275, 290, 5, 5);
                break;
            }
        }
    }

    /**
     * Draw given GameObject to the canvas, also processes movement
     * @param ctx HTML canvas context
     * @param o GameObject being drawn
     */
    private static drawObject(ctx: CanvasRenderingContext2D, o:GameObject): void {
        let [x, y]: [number, number] = o.getPos();
        let [w, h]: [number, number] = o.getSize();
        // halt is a global stop command, otherwise process movement.
        if (!LHF.player.halt) {
            if (o instanceof Thing)
                o.hunt(LHF.player.getPos());
            if (!(o instanceof Family))
                o.move();
        }
        // After movement is processed, draw
        ctx.fillStyle = o.color;
        ctx.fillRect(x, y, w, h)
    }

    private static drawPlayer(ctx: CanvasRenderingContext2D): void {
        LHF.drawObject(ctx, LHF.player);
    }

    /**
     * Given an array of GOs, draw all that are alive and remove dead from list
     * @param ctx HTML Canvas context
     * @param objects Array of GameObjects being drawn
     * @returns a new Array of GOs with the 'dead' removed
     */
    private static drawObjects(ctx: CanvasRenderingContext2D, objects: Array<GameObject>): Array<GameObject> {
        let _arr: Array<GameObject> = [];
        objects.map((o: GameObject)=>{
            if (o.isAlive()) {
                _arr.push(o);
                LHF.drawObject(ctx, o);
            }
        });
        return _arr;
    }

    private static drawEnemies(ctx: CanvasRenderingContext2D): void {
        LHF.enemies = LHF.drawObjects(ctx, LHF.enemies) as Array<Enemy>;
    }

    private static drawThings(ctx: CanvasRenderingContext2D): void {
        LHF.things = LHF.drawObjects(ctx, LHF.things) as Array<Thing>;
    }

    private static drawBullets(ctx: CanvasRenderingContext2D): void {
        LHF.player.bullets = LHF.drawObjects(ctx, LHF.player.bullets) as Array<Bullet>;
    }

    private static drawFamily(ctx: CanvasRenderingContext2D): void {
        LHF.family = LHF.drawObjects(ctx, LHF.family) as Array<Family>;
    }

    /**
     * Event handler for collisions, fired by collide methods on certain objs
     * @param e CustomEvent with detail = { source: GameObject, target: Actor }
     */
    private static handleCollision(e: Event): void {
        let source = (e as CustomEvent).detail.source;
        let target = (e as CustomEvent).detail.target;
        
        if (source instanceof Bullet && target instanceof Enemy) {
            (target as Enemy).damage();
        } else if (source instanceof Player && target instanceof Family) {
            // increment saved, then add saved * member_score
            LHF.score += ++LHF.saved * (target as Family).getScore();
        }
    }

    /**
     * Event handler for gameplay deaths, fired by Actor.kill()
     * @param e CustomEvent with detail = dead: Actor
     */
    private static handleDeath(e: Event): void {
        let dead: Actor = (e as CustomEvent).detail;
        if (dead instanceof Enemy) {
            LHF.score += (dead as Enemy).getScore();
        } else if (dead instanceof Family) {
            // Things turn family members into Mooks
            let [x, y]: [number, number] = dead.getPos();
            LHF.enemies.push(new Mook(x, y));
        } else if (dead instanceof Player) {
            // -1 life, revive player if more lives remain
            if (--LHF.lives > 0) { 
                LHF.player.revive();
            }
        } 
    }

    /**
     * Key handler; handles both down and up events
     * @param which boolean, true if keydown false if keyup
     * @param key key being pressed, passed from KeyboardEvent key property
     */
    private static handleKey(which: boolean, key: string): void {
        let c: Controls = LHF.controls;
        // Scene 0 is the menu, only needs keydown commands
        if (LHF.scene == 0 && which) {
            switch (key) {
                // selected is a number which tells the game which option is selected
                case c.up: {
                    // Keep lower bound and decrement
                    LHF.selected = LHF.selected == 0 ? 0 : LHF.selected - 1;
                    break;
                }
                case c.down: {
                    // Keep upper bound and increment
                    // Right now I just hard code menuOptions to be the upper bound
                    LHF.selected = LHF.selected < LHF.menuOptions ? LHF.menuOptions : LHF.selected + 1;
                    break;
                }
                case 'Enter': {
                    // selected == 0 is start game
                    if (LHF.selected == 0) {
                        // load level 1
                        LHF.sceneChange(1);
                    }
                }
            }
        // General game controls for every other scene
        } else {
            let p: Player = LHF.player;
            /**
             * Controls modify boolean properties on the Player object
             * keydown events set the corresponding property to true
             * keyup events do the opposite.
             */
            switch (key) {
                case c.left: {
                    p.left = which;
                    break;
                }
                case c.right: {
                    p.right = which;
                    break;
                }
                case c.up: {
                    p.up = which;
                    break;
                }
                case c.down: {
                    p.down = which;
                    break;
                }
                case c.fleft: {
                    p.fleft = which;
                    break;
                }
                case c.fright: {
                    p.fright = which;
                    break;
                }
                case c.fup: {
                    p.fup = which;
                    break;
                }
                case c.fdown: {
                    p.fdown = which;
                    break;
                }
            }
        }
    }

    private handleKeyDown(e: KeyboardEvent): void {
        LHF.handleKey(true, e.key);
    }

    private handleKeyUp(e: KeyboardEvent): void {
        LHF.handleKey(false, e.key);
    }

    private createEventHandlers(): void {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('collision', LHF.handleCollision)
        window.addEventListener('death', LHF.handleDeath)
    }
    
    // update is called once per tick
    update(ctx: CanvasRenderingContext2D): void {
        LHF.drawBG(ctx);
        if (LHF.scene == 0)
            LHF.drawMenu(ctx);
        else {
            LHF.drawUI(ctx);
            LHF.drawEnemies(ctx);
            LHF.drawThings(ctx);
            LHF.drawFamily(ctx);
            LHF.drawPlayer(ctx);
            if(!LHF.player.isRecoiling())
                LHF.player.fire();
            LHF.drawBullets(ctx);
            LHF.player.bullets.map((bullet) => {
                bullet.collide(LHF.enemies);
            });
            LHF.enemies.map((enemy) => {
                enemy.collide(LHF.player);
            });
            LHF.things.map((thing) => {
                thing.collide(LHF.player);
            });
            LHF.family.map((member) => {
                member.collide(LHF.player);
                LHF.things.map((thing) => {
                    member.collide(thing);
                });
            });
        }
    }

    constructor() {
        let canvas = document.getElementById('canvas') as HTMLCanvasElement;
        let ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        
        this.canvas = canvas;
        this.ctx = ctx;
        this.createEventHandlers();
        setInterval(this.update, 10, this.ctx)
    }

}

onMounted(() => {
    new LHF();
});
</script>

<template></template>