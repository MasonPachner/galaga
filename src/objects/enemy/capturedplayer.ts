import { Assets } from "../../systems/assets";
import { BezierCurve, Path } from "../../systems/paths";
import { Enemies } from "../enemies";
import { EnemyMoveState, EnemyShip } from "./enemyship";

export class CapturedPlayerShip extends EnemyShip {
    public override readonly color: string = "rgba(255,0,0,1)";
    public override readonly images = [Assets.capture];
    public override readonly moveState = EnemyMoveState.following;
    public override canAttack = false;

    public override score(): number {
        return 1000;
    }

    public getAttackPath(): BezierCurve {
        let attackWeight = Math.random();
        if (attackWeight < .7) {
            return Path.attackVector(Math.random() > 0.5 ? 1 : -1, this.location);
        }
        return Path.attackSweep(Math.random() > 0.5 ? 1 : -1, this.location);
    };
}