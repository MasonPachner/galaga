import { Assets } from "../../systems/assets";
import { BezierCurve, Path } from "../../systems/paths";
import { Enemies } from "../enemies";
import { Player } from "../player";
import { EnemyMoveState, EnemyShip } from "./enemyship";

export class BossShip extends EnemyShip {
    public override readonly color: string = "rgba(230,40,230,1)";
    public override readonly images = [Assets.boss1, Assets.boss2];
    public override readonly lives = 2;

    public override score(): number {
        if (this.moveState == EnemyMoveState.lockToFormation) return 150;
        if (this.buddies == 0) {
            return 400;
        }
        return this.buddies * 800;
    }


    public getAttackPath(): BezierCurve {
        let attackWeight = Math.random();
        if (attackWeight < 0.3 && !this.ownsAShip && Player.players.length > 0) {
            this.isTractor = true;
            return Path.tractorBeam(this.location, Player.players[0].location);
        } else if (attackWeight < 0.7 && !this.ownsAShip) {
            this.getBuddies();
            this.isTractor = false;
            return Path.attackVector(Math.random() > 0.5 ? 1 : -1, this.location);
        }
        this.getBuddies();
        this.isTractor = false;
        return Path.attackSweep(Math.random() > 0.5 ? 1 : -1, this.location);
    };


    private getBuddies() {
        for (let enemyI in Enemies.enemies) {
            let enemy = Enemies.enemies[enemyI];
            if (enemy.formationLocation.x == this.formationLocation?.x &&
                (enemy.formationLocation.y + 1 == this.formationLocation?.y || enemy.formationLocation.y - 1 == this.formationLocation?.y) &&
                enemy.moveState == EnemyMoveState.lockToFormation && !enemy.dirty
            ) {
                enemy.overrideAttack = true;
                this.buddies++;
            }
        }
        if (this.ownsAShip) {
            this.buddies++;
        }
    }

}