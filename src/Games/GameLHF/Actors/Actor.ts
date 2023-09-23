import { GameObject } from "../GameObject";

export class Actor extends GameObject {
    protected health: number = 1;
    public fleft: boolean = false;
    public fright: boolean = false;
    public fup: boolean = false;
    public fdown: boolean = false;
    protected recoiling: boolean = false;

    public async waitfor(ms: number) {
        return new Promise<void>((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    protected kill() {
        super.kill();
        window.dispatchEvent(new CustomEvent("death", {
            detail: this
        }));
    }

    public damage(): void {
        if (--this.health <= 0) {
            this.kill();
        }
    }

    public isRecoiling(): boolean {
        return this.recoiling;
    }
}