import { BezierCurve, Path } from "../../systems/paths";
import { Enemies } from "../enemies";
import { EnemyShip } from "./enemyship";

export class ChallengeShip extends EnemyShip {
    public override readonly color: string = "rgba(0,0,255,1)";
    private readonly imageType = this.enemyParams.imageType ?? 0;
    public override readonly images = Enemies.challengeImages[this.imageType];

    public override score(): number {
        return 160;
    }


    public getAttackPath(): BezierCurve {
        let attackWeight = Math.random();
        if (attackWeight < .7) {
            return Path.attackVector(Math.random() > 0.5 ? 1 : -1, this.location);
        }
        return Path.attackSweep(Math.random() > 0.5 ? 1 : -1, this.location);
    };
}