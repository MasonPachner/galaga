import { Enemies } from "../objects/enemies";
import { EnemyMoveState, EnemyShip } from "../objects/enemy/enemyship";
import { Player } from "../objects/player";
import { PlayerMoveState } from "../objects/playership";
import { Projectiles } from "../objects/projectiles";
import { Ship } from "../objects/ship";
import { Wave } from "../objects/wave";
import { Assets } from "./assets";
import { ScreenText } from "./screen-text";
import { Utils } from "./utils";

export class Collisions {
    private static groupID = 0;
    private static groupBonuses = [1000, 1000, 1500, 1500, 2000, 2000]

    public static collisonHandler() {
        let score = 0;
        Enemies.enemies.forEach((enemy: EnemyShip) => {
            for (let pI in Projectiles.proj) {
                let pro = Projectiles.proj[pI];
                if (pro.playerDamage) continue;
                if (Utils.distBetween(enemy.location, pro.location) <= pro.size + Ship.size && (enemy.moveState != EnemyMoveState.spinning)) {
                    pro.dirty = true;
                    enemy.setDirty(true);
                    pro.owner.waveHits += 1;
                    pro.owner.registerHit();
                    if (enemy.lives == 0) {
                        let nextScore = enemy.score();
                        score += nextScore;
                        if (Enemies.checkGroupBonus(enemy.groupID)) {
                            if (Wave.isChallengeLevel()) {
                                nextScore = Wave.challengeLevelCount >= 6 ? 3000 : Collisions.groupBonuses[Wave.challengeLevelCount - 1];
                                score += nextScore;
                                ScreenText.addText(nextScore.toString(), enemy.location.x, enemy.location.y, 26, 1500, 'rgba(255,34,255,1)');
                            } else {
                                let bonus = enemy.groupBonus();
                                if (bonus > 0) {
                                    nextScore = bonus;
                                    score += bonus;
                                    ScreenText.addText(nextScore.toString(), enemy.location.x, enemy.location.y, 26, 1500, 'rgba(255,34,255,1)');
                                } else {
                                    ScreenText.addText(nextScore.toString(), enemy.location.x, enemy.location.y, 26, 1500, 'rgba(255,34,34,1)');
                                }
                            }
                        } else {
                            ScreenText.addText(nextScore.toString(), enemy.location.x, enemy.location.y, 26, 1500, 'rgba(255,34,34,1)');
                        }

                    }
                }
            }
            for (let playerI in Player.players) {
                let nextP = Player.players[playerI];
                if (Utils.distBetween(nextP.location, enemy.location) <= Ship.size + Ship.size) {
                    if (nextP.spawnProtection < 0 && (nextP.moveState == PlayerMoveState.playerControl || nextP.moveState == PlayerMoveState.returnToPlayer)) {
                        nextP.setDirty();
                        Utils.burstPlay(Assets.playerExplosion, 0.3);
                        if (Player.players.length == 1)
                            Enemies.canAttack = false;
                    }
                    enemy.setDirty(true);
                }
            }
        });
        for (let pI in Projectiles.proj) {
            let pro = Projectiles.proj[pI];

            for (let playerI in Player.players) {
                let nextP = Player.players[playerI];
                if (pro.beam) {
                    if ((nextP.moveState == PlayerMoveState.playerControl || nextP.moveState == PlayerMoveState.moveToSpot) && nextP.spawnProtection < 0 && pro.collidingWithPlayer(nextP.location, Ship.size)) {
                        nextP.moveState = PlayerMoveState.beingBeamed;
                        nextP.beamData = {
                            location: {
                                x: pro.owner.location.x,
                                y: pro.owner.location.y + pro.owner.size + Ship.size * 1.5,
                            },
                            owner: pro.owner
                        };
                    }
                } else {
                    if (pro.playerDamage && nextP.spawnProtection < 0 && Utils.distBetween(nextP.location, pro.location) <= pro.size + Ship.size) {
                        pro.dirty = true;
                        nextP.setDirty();
                        Utils.burstPlay(Assets.playerExplosion, 0.3);
                        if (Player.players.length == 1)
                            Enemies.canAttack = false;
                    }
                }
            }
        }


        Enemies.clean();
        Projectiles.clean();
        return score;
    }

    // Reference: https://stackoverflow.com/questions/37224912/circle-line-segment-collision
    // private lineCircleIntersection(pt1, pt2, circle) {
    //     let v1 = {
    //         x: pt2.x - pt1.x,
    //         y: pt2.y - pt1.y
    //     };
    //     let v2 = {
    //         x: pt1.x - circle.center.x,
    //         y: pt1.y - circle.center.y
    //     };
    //     let b = -2 * (v1.x * v2.x + v1.y * v2.y);
    //     let c = 2 * (v1.x * v1.x + v1.y * v1.y);
    //     let d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.radius * circle.radius));
    //     if (isNaN(d)) { // no intercept
    //         return false;
    //     }
    //     // These represent the unit distance of point one and two on the line
    //     let u1 = (b - d) / c;
    //     let u2 = (b + d) / c;
    //     if (u1 <= 1 && u1 >= 0) { // If point on the line segment
    //         return true;
    //     }
    //     if (u2 <= 1 && u2 >= 0) { // If point on the line segment
    //         return true;
    //     }
    //     return false;
    // }
}