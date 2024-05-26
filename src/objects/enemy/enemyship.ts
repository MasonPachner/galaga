import { Assets } from "../../systems/assets";
import { Location } from "../../systems/location";
import { ParticleSystem } from "../../systems/particle-system";
import { BezierCurve } from "../../systems/paths";
import { Utils } from "../../systems/utils";
import { Enemies } from "../enemies";
import { Player } from "../player";
import { Projectiles } from "../projectiles";
import { Ship } from "../ship";

export enum EnemyMoveState {
    noUpdate = "noupdate", // -1
    followingEntrancePath = "FollowingEntrancePath", // 0
    returnToFormation = "ReturnToFormation", //1
    alignInFormation = "AlignInFormation", // 7
    lockToFormation = "LockToFormation", // 2
    followingAttackPath = "FollowingAttackPath", // 3
    spinning = "Spinning", // 4
    tractoring = "Tractoring", // 5
    following = "Following", // 6
}

export interface EnemyParams {
    formationLocation: Location,
    formationEntrance?: BezierCurve,
    delay?: number,
    groupID?: number,
    location?: Location,
    owner?: Ship,
    ownedShip?: Ship;
    imageType?: number;
    rotation?: number;
    speed?: number;
}

export abstract class EnemyShip extends Ship {
    public canAttack = true;
    public overrideAttack = false;
    public tractorExpand = true;
    public transformer = false;
    public buddies = 0;
    public currentTime = 0;
    public attackCooldown = 0;
    public attackDelay = 100;
    public override projectiles = 2;
    public timeToFinish = 0;
    public beamGroup = ++Enemies.id;
    public override killedByPlayer = false;
    public abstract readonly images: string[];
    public ownsAShip: boolean = false;
    public isTractor = false;
    public formationLocation: Location;
    public formationEntrance?: BezierCurve;
    public delay: number = 0;
    public groupID?: number;
    public owner?: Ship;
    public ownedShip?: Ship;
    public abstract readonly color: string;
    public attackUntilDestroyed: boolean = false;
    public moveState = EnemyMoveState.noUpdate;
    public override location = {
        x: Infinity,
        y: Infinity,
    };


    constructor(protected readonly enemyParams: EnemyParams) {
        super();
        this.formationLocation = this.enemyParams.formationLocation;
        this.formationEntrance = this.enemyParams.formationEntrance;
        if (this.enemyParams.delay) {
            this.delay = this.enemyParams.delay;
        }
        if (this.enemyParams.groupID !== undefined) {
            this.groupID = this.enemyParams.groupID;
        }

        this.owner = this.enemyParams.owner;
        this.ownedShip = this.enemyParams.ownedShip;
        if (this.enemyParams.location) {
            this.location = {
                x: this.enemyParams.location.x,
                y: this.enemyParams.location.y,
            }
        }

        if (this.enemyParams.rotation) {
            this.rotation = this.enemyParams.rotation
        }
        if (this.enemyParams.speed) {
            this.speed = this.enemyParams.speed
        }

    }


    public override handleDirty() {
        ParticleSystem.ufoExplosion(this.location.x, this.location.y, this.color);
    };

    public abstract getAttackPath(): BezierCurve;
    public abstract score(): number;

    public groupBonus() {
        return 0;
    };

    public setupAttack() {
        if (this.overrideAttack) {
            this.delay += 300;
        }
        let pathData = this.getAttackPath();
        this.timeToFinish = pathData.duration ?? 0;
        this.formationEntrance = pathData;
        this.moveState = EnemyMoveState.followingAttackPath;
        this.currentTime = 0;
        this.attackCooldown = 0;
        Enemies.addAttacker();
    }

    //Standard enemy attack, swoop down, shoot
    public attack(elapsedTime: number) {
        if ((this.delay ?? 0) > 0 || Player.players.length == 0) return;
        if (((this.moveState == EnemyMoveState.followingAttackPath && this.projectiles > 0) ||
            (this.moveState == EnemyMoveState.followingEntrancePath && this.projectiles > 1)) &&
            (this.location.y > 0.3) &&
            (this.location.y < 0.55) &&
            this.attackCooldown >= this.attackDelay && !this.isTractor) {

            let direction = Utils.angleBetween(Player.players[0].location, this.location);
            Projectiles.makeProjectile(direction, this.location, this, 'rgba(0,0,255,1', Player.players[0]?.location);
            Utils.burstPlay(Assets.enemyLaser,0.2);
            this.attackCooldown = 0;
            this.projectiles--;
        } else {
            this.attackCooldown += elapsedTime;
        }
    }


    public followPath(elapsedTime: number) {
        if (this.formationEntrance) {
            let nextLocationIndex = Math.floor((this.currentTime / this.timeToFinish) * this.formationEntrance.path.length);
            this.location.x = this.formationEntrance.path[nextLocationIndex].x;
            this.location.y = this.formationEntrance.path[nextLocationIndex].y;
            this.currentTime += elapsedTime;
            if (nextLocationIndex + 1 < this.formationEntrance?.path.length) {
                this.rotation = Utils.angleBetween(this.formationEntrance.path[nextLocationIndex + 1], this.formationEntrance.path[nextLocationIndex]);
            }
        } else {
            throw new Error("No path to follow")
        }
    }



}