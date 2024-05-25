import { BezierCurve, Path } from "../../systems/paths";
import { Enemies } from "../enemies";
import { EnemyMoveState, EnemyShip } from "./enemyship";

export class BeeShip extends EnemyShip {
    public override readonly color: string = "rgba(100,0,255,1)";
    public override readonly images = [Enemies.beeImage];

    public override score(): number {
        return this.moveState == EnemyMoveState.lockToFormation ? 50 : 100;
    }

    public override getAttackPath(): BezierCurve {
        const attackVector = Math.random() > 0.5 ? 1 : -1;
        const location = this.location;
        return Math.random() > 0.8 ? Path.beeAttackVector(attackVector, location) : Path.attackVector(attackVector, location);
    };
}