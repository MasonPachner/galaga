import { Location } from "../systems/location";
import { ParticleSystem } from "../systems/particle-system";
import { EnemyShip } from "./enemy/enemyship";
import { Player } from "./player";
import { Ship } from "./ship";

export enum PlayerMoveState {
    playerControl = "PlayerControl", // 0
    beingBeamed = "BeingBeamed", // 1
    spinning = "Spinning", // 2
    returnToPlayer = "ReturnToPlayer", // 3
    moveToSpot = "MoveToSpot", // 4
}

export interface BeamData {
    location: Location,
    owner: EnemyShip,
}

export class PlayerShip extends Ship {
    public static attactDelayTotal = 300;
    public attackDelay = PlayerShip.attactDelayTotal;
    public shots: number = 0;
    public spawnProtection = 5000;
    public beamData?: BeamData;
    public moveState: string = PlayerMoveState.playerControl;
    public projectileQueue: boolean = true;
    public override location: Location = {
        x: 0.5,
        y: Player.playerY
    };

    public handleDirty(): void {
        // todo
    }
    public override setDirty() {
        this.dirty = true;
        ParticleSystem.playerExplosion(this.location.x, this.location.y);
    };


    public addHit() {
        Player.totalHits++;
    }

}