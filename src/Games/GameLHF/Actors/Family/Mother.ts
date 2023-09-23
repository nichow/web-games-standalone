import { Family } from "./Family";

export class Mother extends Family {
    constructor(x: number, y: number) {
        super();
        this.x = x;
        this.y = y;
        this.w = 10;
        this.h = 15;
        this.color = 'pink';
    }
}