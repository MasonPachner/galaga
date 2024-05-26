import { Location } from "../systems/location";



export abstract class Ship {
    public dirty: boolean = false;
    public projectiles: number = 2;
    public abstract location: Location;
    public lives: number = 1;
    public killedByPlayer: boolean = false;
    public static readonly size: number = 0.02;
    public rotation: number = Math.PI / 2;
    public thrustVector: Location = { x: 0, y: 0 };
    public speed: number = 0;
    public spinTime: number = 2500;

    public returnMissile() {
        this.projectiles++;
    }


    public registerHit() {
       
    }

    public abstract handleDirty(): void;


    public setDirty(impact: boolean) {
        this.killedByPlayer = impact;
        this.dirty = this.lives <= 1;
        this.lives--;
    }
};