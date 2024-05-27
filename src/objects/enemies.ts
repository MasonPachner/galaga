import { Assets } from "../systems/assets";
import { ParticleSystem } from "../systems/particle-system";
import { Path } from "../systems/paths";
import { Renderer } from "../systems/renderer";
import { ScreenText } from "../systems/screen-text";
import { Utils } from "../systems/utils";
import { BeeShip } from "./enemy/bee";
import { BossShip } from "./enemy/boss";
import { ButterflyShip } from "./enemy/butterfly";
import { CapturedPlayerShip } from "./enemy/capturedplayer";
import { ChallengeShip } from "./enemy/challenge";
import { EnemyMoveState, EnemyParams, EnemyShip } from "./enemy/enemyship";
import { TransformShip } from "./enemy/transform";
import { Player } from "./player";
import { Projectiles } from "./projectiles";
import { Ship } from "./ship";
import { Wave } from "./wave";

export class Enemies {
    public static enemies: EnemyShip[] = [];
    public static level = 0;
    public static canAttack = false;
    public static id = 0;
    public static attackers = 0;


    // Fun ships, can't attack, only on challenging waves
    public static makeChallengeUnit(spec: EnemyParams) {
        let challenge = new ChallengeShip(spec);
        Enemies.enemies.push(challenge);
        return challenge;
    }

    // Trnasform ships, only attack, one per wave
    public static makeTransformUnit(spec: EnemyParams) {
        let transform = new TransformShip(spec);
        Enemies.enemies.push(transform);
        return transform;
    }
    // Generates 3 transform ships
    public static generateShips(enemy: EnemyShip) {
        let type = Math.floor(Math.random() * 3);
        for (let i = 0; i < 3; i++) {
            let unit = Enemies.makeTransformUnit({
                delay: i * 300,
                location: {
                    x: enemy.location.x,
                    y: enemy.location.y,
                },
                formationLocation: {
                    x: enemy.formationLocation.x,
                    y: enemy.formationLocation.y,
                },
                imageType: type,
            });
            unit.setupAttack();
        }
    }
    // Standard dude, can team up with a Boss
    public static makeButterfly(spec: EnemyParams) : ButterflyShip {
        const butterfly = new ButterflyShip(spec);
        Enemies.enemies.push(butterfly);
        return butterfly;
    }
    //Captured player ship
    public static makeBadPlayer(spec: EnemyParams) {
        let badPlayer = new CapturedPlayerShip(spec);
        Enemies.enemies.push(badPlayer);
        ScreenText.addText("Fighter Captured", 0.5, 0.5, 30, 3000, 'rgba(255,34,34,1)');
        return badPlayer;
    }
    //Dive bombers
    public static makeBee(spec: EnemyParams) {
        const bee = new BeeShip(spec);
        Enemies.enemies.push(bee);
        return bee;
    }
    // The cause of everything nasty. Multiple hits, strange points, buddy attack, tractor beams.
    public static makeBoss(spec: EnemyParams) {
        let boss = new BossShip(spec);
        Enemies.enemies.push(boss);
        return boss;
    }

    // Tractor beam attack for Boss Galagas
    public static tractorBeam(elapsedTime: number, enemy: EnemyShip) {
        if (enemy.delay > 0) return;
        if (enemy.moveState == EnemyMoveState.tractoring && enemy.attackCooldown >= enemy.attackDelay) {
            enemy.rotation = Math.PI * 3 / 2;
            if (enemy.tractorExpand) {
                Projectiles.makeBeam(enemy.rotation, enemy.location, enemy, Math.PI / 16, enemy.beamGroup);
            }
            if (enemy.projectiles == 2) {
                Utils.burstPlay(Assets.tractorBeam,0.4);
            }
            enemy.attackCooldown = 0;
            enemy.projectiles++;

            enemy.tractorExpand = enemy.projectiles < 80;
            if (Projectiles.beamGroup(enemy.beamGroup).length == 0) {
                enemy.moveState = EnemyMoveState.returnToFormation;
                enemy.projectiles = 2;
                enemy.tractorExpand = true;
            }
        } else {
            enemy.attackCooldown += elapsedTime;
        }

    }
    /**
     * Oh boy. There are a lot of different move states for the enemies. 
     * Handles location changes for any enemy state. Could change?
     */
    public static updateLocation(enemy: EnemyShip, elapsedTime: number) {
        if (enemy.delay >= 0) {
            if (enemy.moveState != EnemyMoveState.noUpdate) {
                enemy.delay -= elapsedTime;
            }
            return;
        }
        if (enemy.moveState == EnemyMoveState.followingEntrancePath) { // Entrance path
            if (enemy.currentTime >= enemy.timeToFinish) {
                if (Enemies.isChallengeLevel()) {
                    enemy.location.x = -1;
                    enemy.location.y = -1;
                    enemy.setDirty(false);
                    return;
                }
                enemy.moveState = EnemyMoveState.returnToFormation;
                return;
            }
            enemy.followPath(elapsedTime);
        } else if (enemy.moveState == EnemyMoveState.returnToFormation) { // Glide to formation location
            enemy.rotation = Utils.angleBetween(Wave.waveLoc[enemy.formationLocation.y][enemy.formationLocation.x], enemy.location);
            enemy.location.x += Math.cos(enemy.rotation - Math.PI) * elapsedTime * 0.0002;
            enemy.location.y += Math.sin(enemy.rotation - Math.PI) * elapsedTime * 0.0002;
            if (Utils.distBetween(enemy.location, Wave.waveLoc[enemy.formationLocation.y][enemy.formationLocation.x]) < Ship.size / 2) {
                enemy.location.x = Wave.waveLoc[enemy.formationLocation.y][enemy.formationLocation.x].x;
                enemy.location.y = Wave.waveLoc[enemy.formationLocation.y][enemy.formationLocation.x].y;
                enemy.moveState = EnemyMoveState.alignInFormation;
                enemy.buddies = 0;
                enemy.overrideAttack = false;
            }
        } else if (enemy.moveState == EnemyMoveState.alignInFormation) { // rotate to formation location.
            enemy.rotation = Utils.cycle(enemy.rotation)
            let dir = (enemy.rotation > Math.PI / 2 && enemy.rotation < Math.PI * 3 / 2) ? 1 : -1;
            enemy.rotation = enemy.rotation + dir * elapsedTime / 450;
            enemy.location.x = Wave.waveLoc[enemy.formationLocation.y][enemy.formationLocation.x].x;
            enemy.location.y = Wave.waveLoc[enemy.formationLocation.y][enemy.formationLocation.x].y;
            if (Math.abs(enemy.rotation - (Math.PI * 3 / 2)) < 0.3) {
                enemy.rotation = Math.PI * 3 / 2;
                enemy.moveState = EnemyMoveState.lockToFormation;
            }
        } else if (enemy.moveState == EnemyMoveState.lockToFormation) { // Lock to formation location
            enemy.location.x = Wave.waveLoc[enemy.formationLocation.y][enemy.formationLocation.x].x;
            enemy.location.y = Wave.waveLoc[enemy.formationLocation.y][enemy.formationLocation.x].y;
            if (((Enemies.canAttack && enemy.canAttack && Enemies.attackers < 1 && Math.random() * 100 > 99) || enemy.overrideAttack || enemy.attackUntilDestroyed)) {
                enemy.setupAttack();
            }
        } else if (enemy.moveState == EnemyMoveState.followingAttackPath) { // Attack formation location
            enemy.followPath(elapsedTime);
            if (enemy.transformer) {
                if ((enemy.currentTime / enemy.timeToFinish) < 0.1) {
                    ParticleSystem.transformOccuring(enemy.location.x, enemy.location.y, { direction: enemy.rotation, range: Math.PI / 6 });
                    ParticleSystem.transformOccuring(enemy.location.x, enemy.location.y, { direction: enemy.rotation + Math.PI, range: Math.PI / 6 });
                } else {
                    Enemies.generateShips(enemy);
                    enemy.dirty = true;
                    enemy.location.y = -1;
                }
            }
            if (enemy.location.y > 1 && enemy.attackUntilDestroyed && Player.players.length == 0) {
                enemy.location.x = -1;
                enemy.location.y = -1;
                enemy.dirty = true;
            }
            if (enemy.currentTime >= enemy.timeToFinish) {
                enemy.projectiles = 2;
                if (enemy.isTractor) {
                    enemy.projectiles = 2;
                    enemy.moveState = EnemyMoveState.tractoring;
                    Enemies.returnAttacker();
                    return;
                }
                if (enemy.location.y > 1) {
                    if (enemy.attackUntilDestroyed && Player.length == 0) {
                        enemy.location.x = -1;
                        enemy.location.y = -1;
                        enemy.dirty = true;
                    }
                    enemy.location.x = Wave.waveLoc[enemy.formationLocation.y][enemy.formationLocation.x].x;
                    enemy.location.y = 0;
                }
                Enemies.returnAttacker();
                enemy.moveState = EnemyMoveState.returnToFormation;
                return;
            }
        } else if (enemy.moveState == EnemyMoveState.spinning) { // Spinning! Always a good trick
            enemy.rotation += elapsedTime / 100;
            enemy.spinTime -= elapsedTime;
            if (enemy.spinTime <= 0) {
                enemy.spinTime = 4000;
                Player.additionalFighter(enemy.location.x, enemy.location.y);
                enemy.location.x = -1;
                enemy.location.y = -1;
                enemy.dirty = true;
            }
        } else if (enemy.moveState == EnemyMoveState.tractoring) { // Tractor beam
            Enemies.tractorBeam(elapsedTime, enemy);
        } else if (enemy.moveState == EnemyMoveState.following) { // Following
            Enemies.followShip(enemy, elapsedTime);
        }
    }

    public static followShip(enemy: EnemyShip, elapsedTime: number) {
        if (!enemy.owner) {
            throw new Error("Enemy has no owner");
        }
        enemy.rotation = enemy.owner.rotation;
        let locToBe = {
            x: enemy.owner.location.x,
            y: enemy.owner.location.y - Ship.size - Ship.size * 1.5
        };
        let moveRotation = Utils.angleBetween(enemy.location, locToBe);
        if (Utils.distBetween(enemy.location, locToBe) < Ship.size / 2) {
            enemy.location.x = locToBe.x;
            enemy.location.y = locToBe.y;
        } else {
            enemy.location.x += Math.cos(moveRotation) * elapsedTime / 3000;
            enemy.location.y += Math.sin(moveRotation) * elapsedTime / 3000;
        }
    }


    public static render() {
        Enemies.enemies.forEach((e: EnemyShip) => {
            // meoww MyGame.renderer.fillCircle(e.location.x,e.location.y,e.size,'rgba(255,0,0,1)');
            Renderer.drawImage(e.images[e.lives - 1], e.location.x, e.location.y, Ship.size, Ship.size, e.rotation - Math.PI / 2);
        });
    }

    private static readonly validAttackStates = [
        EnemyMoveState.noUpdate,
        EnemyMoveState.followingEntrancePath ,
        EnemyMoveState.returnToFormation ,
        EnemyMoveState.lockToFormation ,
    ]

    /**
     * Update function moves all enemies
     */
    public static update(elapsedTime: number) {
        let checkAttack = true;
        for (let e in Enemies.enemies) {
            let enemy = Enemies.enemies[e];
            checkAttack = checkAttack && (Enemies.validAttackStates.includes(enemy.moveState) || !enemy.canAttack);
            Enemies.updateLocation(enemy, elapsedTime);
            if (!Enemies.isChallengeLevel())
                enemy.attack(elapsedTime);
            if (enemy.owner) {
                if (enemy.owner.dirty) {
                    enemy.moveState = EnemyMoveState.spinning;
                }
            }
        }
        Enemies.canAttack = Enemies.canAttack || checkAttack;
    }

    public static checkGroupBonus(groupCheck?: number) {
        for (let enemyI in Enemies.enemies) {
            let enemy = Enemies.enemies[enemyI];
            if (enemy.groupID == groupCheck && ((enemy.dirty && !enemy.killedByPlayer) || !enemy.dirty)) {
                return false;
            }
        }
        return true;
    }

    public static clean() {
        let cleanUfos: EnemyShip[] = [];
        Enemies.enemies.forEach((e: EnemyShip) => {
            if (!e.dirty) {
                cleanUfos.push(e);
            } else {
                if (Enemies.attackers > 0 && (e.moveState == EnemyMoveState.followingAttackPath || e.moveState == EnemyMoveState.tractoring))
                    Enemies.returnAttacker();
                e.handleDirty();
                if (e.killedByPlayer) {
                    Utils.safePlay(Assets.enemyExplosion);
                }
            }
        });
        Enemies.enemies = cleanUfos;
    }

    public static setLevel(inlevel: number) {
        Enemies.level = inlevel;
    }

    public static isChallengeLevel() {
        return (Enemies.level == 3) || (Enemies.level > 5 && (Enemies.level) % 4 == 3);
    }
    public static returnAttacker() {
        if (Enemies.attackers > 0) {
            Enemies.attackers--;
        }
    }
    public static addAttacker() {
        Enemies.attackers++;
    }
};