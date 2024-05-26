import { Assets } from "../systems/assets";
import { ParticleSystem } from "../systems/particle-system";
import { Renderer } from "../systems/renderer";
import { Utils } from "../systems/utils"
import { Location } from "../systems/location";
import { Ship } from "./ship";
import { EnemyMoveState, EnemyShip } from "./enemy/enemyship";


export abstract class Projectile {
    public dirty: boolean = false;
    public abstract owner: Ship;
    public abstract speed: number;
    public abstract rotation: number;
    public lifespan: number = 7000;
    public abstract color: string;
    public size: number = 0.005;
    public abstract location: Location;
    public abstract updateLocation(elapsedTime: number): void;
    public abstract handleDirty(): void;

    constructor(){
        
    }
    public get playerDamage() {return this.owner instanceof EnemyShip;}
}

export class Beam extends Projectile {
    public override speed: number = 0.0001;
    public strokeSize: number = 0.002;
    public color: string;

    constructor(public override rotation: number, public override location: Location, public override readonly owner: EnemyShip, public readonly arcSize: number, public readonly group: number){
        super();
        this.color =  owner.projectiles % 2 == 0 ? "rgba(0,0,255,1)" : "rgba(255,255,255,1)";

        this.location = {
            x: Math.cos(rotation) * Ship.size + location.x,
            y: Math.sin(rotation) * Ship.size + location.y,
        };
        this.rotation += Math.PI;
    }

    public collidingWithPlayer(playerLocation: Location, playerSize: number){
        let COLLISION_POINTS = 10;
        if (this.owner.dirty || this.owner.ownsAShip || this.owner.moveState != EnemyMoveState.tractoring) {
            this.dirty = true;
            return false;
        }
        for (let i = 0; i < COLLISION_POINTS; i++) {
            let arcChange = i * this.arcSize / COLLISION_POINTS;
            if (Utils.distBetween(playerLocation,
                {
                    x: this.location.x + Math.cos(this.rotation - (this.arcSize / 2) + arcChange) * this.size,
                    y: this.location.y + Math.sin(this.rotation - (this.arcSize / 2) + arcChange) * this.size,
                }) <= this.strokeSize + playerSize) {
                this.owner.ownsAShip = true;
                return true;
            }
        }
        return false;
    }

    public updateLocation(elapsedTime: number) {
        this.size += this.speed * elapsedTime * (this.owner.tractorExpand ? 1 : -1);
        if (this.size < 0.0001)
            this.dirty = true;
        if (this.location.y + this.size > 1)
            this.dirty = true;

    }

    public handleDirty () {
        //console.log("Beam Hit");
    }
}

export class Bullet extends Projectile {
    public missDist: number = 0;
    public override speed: number;
    public range?: number;
    constructor(public override rotation: number, public override location: Location, public override readonly owner: Ship,public override readonly  color: string, public readonly target: Location | undefined) {
        super()
        this.speed = (this.owner instanceof EnemyShip ? 0.4 : 1) * 0.0007

        this.location = {
            x: Math.cos(rotation) * Ship.size + location.x,
            y: Math.sin(rotation) * Ship.size + location.y,
        };
        if (target != undefined) {
            this.range = Math.tan((this.rotation - Math.PI) - Math.PI / 2);
        }
    }
    public updateLocation(elapsedTime: number) {
        let prevY = this.location.y;
        this.location.x -= Math.cos(this.rotation) * this.speed * elapsedTime;
        this.location.y -= Math.sin(this.rotation) * this.speed * elapsedTime;
        if (this.target != undefined && this.location.y >= this.target.y && prevY <= this.target.y) { //Bullet paper check
            this.missDist = this.target.y - this.location.x;
        }
    }
    public handleDirty() {
        this.owner.returnMissile();
    }
}


export class Projectiles {
    public static proj: Projectile[] = [];

    public static makeProjectile(direction: number, inlocation: Location, owner: Ship, color: string, target: Location | undefined) {
        Projectiles.proj.push(new Bullet(direction, inlocation, owner, color, target));
    }

    public static makeBeam(direction: number, inlocation: Location, owner: EnemyShip, arcSize: number, group: number) {
        Projectiles.proj.push(new Beam(direction, inlocation, owner, arcSize, group));
    }
    public static renderProjectiles() {
        console.log(Projectiles.proj.length);
        Projectiles.proj.forEach((e) => {
            if (e instanceof Bullet) {
                Renderer.drawImage(e.playerDamage ? Assets.playerPro :  Assets.enemyPro,
                    e.location.x,
                    e.location.y,
                    e.size, e.size,
                    e.rotation - Math.PI / 2);
                // if(e.playerDamage)
                //     MyGame.renderer.drawLine('rgba(255,255,0,1)', e.location.x,
                //     e.location.y,e.target.x,e.target.y);
            } else if(e instanceof Beam) {
                Renderer.strokeArc(e.color,
                    e.location.x,
                    e.location.y,
                    e.arcSize,
                    e.strokeSize,
                    e.size,
                    e.rotation);
                // MyGame.renderer.fillCircle(
                //     e.location.x,
                //     e.location.y,
                //     e.size,
                //     e.color);
            }
        });
    }

    public static update(elapsedTime: number) {
        Projectiles.proj.forEach(pro => {
            pro.updateLocation(elapsedTime);
            if (pro.location.y < 0 || pro.location.y > 1) {
                pro.dirty = true;
            } else if (pro instanceof Bullet) {
                ParticleSystem.projectileThrust(
                    pro.location.x + Math.cos(pro.rotation) * pro.size / 2,
                    pro.location.y + Math.sin(pro.rotation) * pro.size / 2,
                    { direction: pro.rotation, range: Math.PI / 18 },
                    pro.color);
            }
        });
        Projectiles.clean();
    }
    public static clean() {
        let cleanProj: Projectile[] = [];
        Projectiles.proj.forEach(e => {
            if (!e.dirty) {
                cleanProj.push(e);
            } else {
                e.handleDirty();
            }
        });
        Projectiles.proj = cleanProj;
    }
    public static beamGroup(request: number) {
        let group: Projectile[] = [];
        Projectiles.proj.forEach(e => {
            if (e instanceof Beam && e.group == request) {
                group.push(e);
            }
        });
        return group;
    }

    public static reset() {
        Projectiles.proj.length = 0;
    }
}