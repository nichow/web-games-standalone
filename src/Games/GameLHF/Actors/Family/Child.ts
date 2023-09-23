import { Family } from "./Family";

export class Child extends Family {
    constructor(x: number, y: number) {
        super();
        this.x = x;
        this.y = y;
        this.w = 7.5;
        this.h = 7.5;
        this.color = 'skyblue';
    }
}