import { Location } from "../systems/location";



export abstract class Ship {
    public dirty: boolean = false;
    public projectiles: number = 2;
    public abstract location: Location;
    public lives: number = 1;
    public abstract readonly images: any;
    public killedByPlayer: boolean = false;
    public size: 0.02;
    public rotation: number = Math.PI / 2;
    public thrustVector: any = { x: 0, y: 0 };
    public speed: number = 0;
    public spinTime: number = 2500;

    public returnMissile() {
        if (this.projectiles) {
            this.projectiles++;
        }
    }

    public abstract handleDirty(): void;


    public setDirty(impact: boolean) {
        this.killedByPlayer = impact;
        this.dirty = this.lives <= 1;
        this.lives--;
    }
};