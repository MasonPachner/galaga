import { BezierCurve, Path } from "../../systems/paths";
import { Enemies } from "../enemies";
import { EnemyShip } from "./enemyship";

export class TransformShip extends EnemyShip {
    public override readonly color: string = "rgba(0,255,0,1)";
    private readonly imageType = this.enemyParams.imageType ?? 0;
    public override readonly images = Enemies.tranformImages[this.imageType];
    public override groupID = -Enemies.level;
    public override attackUntilDestroyed: boolean = true;
    public override formationEntrance = Path.attackVector(1, this.location)

    //scorp,flag,bossconian
    private readonly scores = [1000, 2000, 3000];
    public override groupBonus() {
        return this.scores[this.imageType];
    };

    public override score(): number {
        return 160;
    }


    public getAttackPath(): BezierCurve {
        return Path.attackVector(1, this.location)
    };
}