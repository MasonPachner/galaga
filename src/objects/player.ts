import { Persitence } from "../screens/persistance";
import { Assets } from "../systems/assets";
import { ParticleSystem } from "../systems/particle-system";
import { Renderer } from "../systems/renderer";
import { ScreenText } from "../systems/screen-text";
import { Utils } from "../systems/utils";
import { Enemies } from "./enemies";
import { EnemyMoveState, EnemyShip } from "./enemy/enemyship";
import { PlayerMoveState, PlayerShip } from "./playership";
import { Beam, Bullet, Projectiles } from "./projectiles";
import { Ship } from "./ship";
import { Location } from "../systems/location";

export interface Bounds {
    l: number,
    u: number,
    loc: number,
    distance: number,
    isCollide?: boolean,
}

export class Player {
    public static playerY: number = 0.90;
    public static lives = 3;
    public static playerImage = Assets.fighter;
    public static players: PlayerShip[] = [];
    public static newLife = false;
    public static shots = 0;
    public static totalHits = 0;
    public static waveHits = 0;
    public static isGameOver = false;
    public static lastLoc?: Location = undefined;
    public static bounds: Bounds[] = [];
    public static nextLife = 20000;
    public static thrust: number[] = [];
    public static target?: EnemyShip = undefined;
    public static colors = ['rgba(255,255,0,1)', 'rgba(255, 0, 0,1)', 'rgba(255, 0, 255,1)', 'rgba(0, 0, 255,1)', 'rgba(0, 255, 255,1)', 'rgba(0, 255, 0,1)'];
    public static dontBounce = 400;
    public static safeX = 0;
    public static attract = false;



    public static inputMove(num: number) {
        if (!Player.attract) {
            Player.thrust.push(num);
        }
    }
    public static inputShoot() {
        if (!Player.attract) {
            Player.fireMissile();
        }
    }

    public static update(elapsedTime: number, score: number) {
        if (Player.attract) {
            if (Player.target != undefined)
                Player.fireMissile();
            Player.calculateSafeLocation(elapsedTime);
            //MyGame.renderer.strongText("Press any key to start", 25, 20, 'rgba(255,255,255,1)', true);
        }
        for (let playerI in Player.players) {
            let player = Player.players[playerI];
            Player.updateLocation(elapsedTime, player);
            if (player.attackDelay > 0 && !player.projectileQueue) {
                player.attackDelay -= elapsedTime;
            } else {
                player.attackDelay = PlayerShip.attactDelayTotal;
                player.projectileQueue = true;
            }
            if (player.spawnProtection > 0) {
                player.spawnProtection -= elapsedTime;
            }
        }
        Player.thrust.length = 0;
        if (score > Player.nextLife && score <= 1000000) { // No new lives after 1 mill
            Player.nextLife += Player.nextLife > 70000 ? 70000 : 50000; //20k, 70k, 140k, 210k... ect
            Player.newLife = true;
            Player.lives++;
        }
        let clean: PlayerShip[] = [];
        for (let playerI in Player.players) {
            let player = Player.players[playerI];
            if (!player.dirty) clean.push(player);
        }
        Player.players = clean;
        if (Player.players.length == 0) {
            if (Player.lives > 0 && Projectiles.proj.length == 0) {
                Player.players.push(new PlayerShip());
                ScreenText.addText("Ready", 0.5, 0.25, 30, 1500, 'rgba(255,34,34,1)');
                Player.lives--;
            } else if (Player.lives <= 0 && !Player.isGameOver) {
                Player.isGameOver = true;
                Persitence.add("" + Date.now(), {
                    score: score,
                });
            }
        }

    }

    // Fancy AI method with simple objective
    public static calculateSafeLocation(elapsedTime: number) {
        if (Player.players.length == 0) return;
        Player.bounds = [];
        //Calculate bad zones - projectiles
        for (let proI in Projectiles.proj) {
            let pro = Projectiles.proj[proI];
            if (pro.playerDamage && (pro.location.y < (Player.playerY + Ship.size * 6))) {
                if (pro instanceof Bullet) {
                    if (pro.target && pro.damageRange) {
                        const safetyBonus = (Ship.size *1.5);
                        Player.bounds.push({
                            l: pro.damageRange.left - safetyBonus*2,
                            u: pro.damageRange.right + safetyBonus*2,
                            loc: pro.target.x,
                            distance: Utils.distBetween(pro.location, Player.players[0].location),
                            isCollide: pro.location.y > (Player.playerY - safetyBonus) && pro.location.y < (Player.playerY + safetyBonus )
                        });
                    }
                } else if (pro instanceof Beam) {
                    let diff = Math.abs(Math.cos(pro.rotation - (pro.arcSize / 2)) * pro.size);
                    const safetyBonus = (diff + Ship.size * 2.5);
                    Player.bounds.push({
                        l: pro.location.x - safetyBonus,
                        u: pro.location.x + safetyBonus,
                        loc: pro.location.x,
                        distance: Math.abs(Player.playerY - (pro.location.y + pro.size))
                    });
                }
            }

        }
        //Calculate bad zones -enemies
        for (let enemyI in Enemies.enemies) {
            let enemy = Enemies.enemies[enemyI];
            if (enemy.location.y > 0.6 && (enemy.moveState == EnemyMoveState.followingAttackPath || enemy.moveState == EnemyMoveState.tractoring)) { // Don't get hit by badguys
                const safetyBonus = (Ship.size * 2.5);
                Player.bounds.push({
                    l: enemy.location.x - safetyBonus,
                    u: enemy.location.x + safetyBonus,
                    loc: enemy.location.x,
                    distance: Utils.distBetween(enemy.location, Player.players[0].location),
                });
            }

        }

        Player.safeX = 0.5;
        // Find an enemy to attack
        if (Enemies.enemies.length > 0) {
            if (Player.target == undefined || Player.target.dirty) {
                Player.lastLoc = undefined;
                Player.target = Enemies.enemies[Math.floor(Math.random() * Enemies.enemies.length)];
            }
            if ((Player.target?.location.y ?? 0) > 2) {
                Player.target = undefined;
                Player.lastLoc = undefined;
            } else {
                Player.safeX = Player.target?.location.x ?? 0;
                if (Player.lastLoc != undefined && Player.target !== undefined) {
                    let offset = (Player.target.location.x - Player.lastLoc.x) * ((Player.players[0].location.y - Player.lastLoc.y) / 11); // Try to aim where the target is gonna be
                    Player.safeX = Player.safeX + offset;
                }
            }
        }
        if (Player.target != undefined && Player.dontBounce < 0) {
            Player.lastLoc = {
                x: Player.target.location.x,
                y: Player.target.location.y,
            };
        } else {
            Player.dontBounce -= elapsedTime;
        }

        const immediate = Player.bounds.filter((a) => (a.distance < Ship.size * 5) || a.isCollide);
        if (immediate.length > 0) {
            console.log("Immediate collision detected");
            const playerX = Player.players[0].location.x;
            const aggregate = immediate.reduce((total: Bounds, num: Bounds) => {
                return {
                    l: Math.min(total.l, num.l),
                    u: Math.max(total.u, num.u),
                    loc: num.loc,
                    distance: Math.min(total.distance, num.distance),
                    isCollide: total.isCollide || num.isCollide,
                };
            });
            if (aggregate !== undefined) {
                // Try to cross is there isn't something in the way
                const projectIsRightOfShip = ((aggregate.u-aggregate.l)/2) - playerX > 0;
                if (projectIsRightOfShip) {
                    Player.safeX = aggregate.isCollide ? aggregate.u : aggregate.l;
                } else {
                    Player.safeX = aggregate.isCollide ? aggregate.l : aggregate.u;
                }
            }
            console.log("playerx:", playerX,"SafeX", Player.safeX, "low:", aggregate.l, "high:", aggregate.u, "collide:", aggregate.isCollide);
            if(aggregate.isCollide){

                debugger;
            }
        }
        // if projectile.line intersection w/ playerMove spot, move
        // if enemy.line intersection w/ playerMove spot, move
    }

    public static gameOver() {
        ScreenText.addText("GAME OVER", 0.5, 0.5, 30, 100, 'rgba(255,100,100,1)');
        ScreenText.addText("SHOTS: " + Player.shots, 0.5, 0.55, 30, 100, 'rgba(255,100,255,1)');
        ScreenText.addText("HITS: " + Player.totalHits, 0.5, 0.6, 30, 100, 'rgba(255,100,255,1)');
        ScreenText.addText("ACCURACY: " + (Player.shots == 0 ? '0' : Number((Player.totalHits / Player.shots) * 100).toFixed(2)) + "%", 0.5, 0.65, 30, 100, 'rgba(255,100,255,1)');
        Player.isGameOver = true;
    }
    public static getPlayerIndex(player: PlayerShip) {
        let index = -1;
        for (let playerI in Player.players) {
            let playerOther = Player.players[playerI];
            if (playerOther == player) {
                index = Number(playerI);
            }
        }
        return index;
    }
    public static updateLocation(elapsedTime: number, player: PlayerShip) {
        if (player.moveState == PlayerMoveState.playerControl) { // Normal movement
            if (Player.attract) {
                player.moveState = PlayerMoveState.moveToSpot;
                return;
            }
            let speed = Player.thrust.reduce((total: number, num: number) => {
                return total + num;
            }, 0);
            player.location.x += speed * elapsedTime * 0.0008;
        } else if (player.moveState == PlayerMoveState.beingBeamed) { // Being beamed
            if (player.beamData?.owner == undefined) {
                throw new Error("Beam data does not exist");
            }
            Enemies.canAttack = false;
            player.rotation += elapsedTime / 100;
            let rotation = Utils.angleBetween(player.location, player.beamData.location);
            player.location.x += Math.cos(rotation) * elapsedTime / 10000;
            player.location.y += Math.sin(rotation) * elapsedTime / 10000;
            if (player.beamData.owner.dirty || player.beamData.owner.moveState != EnemyMoveState.tractoring) {
                player.beamData.location = {
                    x: player.location.x,
                    y: 0.90,
                };
                player.rotation = Math.PI / 2;
            }
            if (Utils.distBetweenWithWrapping(player.location, player.beamData.location) < Ship.size || player.location.y > Player.playerY) {
                player.location.x = player.beamData.location.x;
                player.location.y = player.beamData.location.y;
                if (!player.beamData.owner.dirty) { // Tracted!
                    player.moveState = PlayerMoveState.spinning;
                    return;
                }
                player.moveState = PlayerMoveState.playerControl; // This seems wrong, not supportive of a spare ship
            }
        } else if (player.moveState == PlayerMoveState.spinning) { // Spin and become bad guy. Just because you are a bad guy, does not make you "Badguy"
            if (player.beamData?.owner == undefined) {
                throw new Error("Beam data does not exist");
            }
            Enemies.canAttack = false;
            player.rotation += elapsedTime / 100;
            player.spinTime -= elapsedTime;
            if (player.spinTime <= 0 || player.beamData.owner.moveState != EnemyMoveState.tractoring) {
                player.spinTime = 4000;
                Enemies.makeBadPlayer({
                    formationLocation: {
                        x: 0,
                        y: player.beamData.owner.formationLocation.y,
                    },
                    location: {
                        x: player.location.x,
                        y: player.location.y,
                    },
                    delay: 200,
                    speed: 0.00013,
                    owner: player.beamData.owner,
                });

                player.location.x = -1;
                player.location.y = -1;
                player.dirty = true;
            }
        } else if (player.moveState == PlayerMoveState.returnToPlayer) { // return ship 
            Enemies.canAttack = false;
            let index = Player.getPlayerIndex(player);
            let togo = {
                x: Player.players[0].location.x + (2 * Ship.size) * (index),
                y: Player.playerY,
            };
            let rotation = Utils.angleBetween(player.location, togo);
            player.location.x += Math.cos(rotation) * elapsedTime / 7000;
            player.location.y += Math.sin(rotation) * elapsedTime / 7000;
            if (Utils.distBetweenWithWrapping(player.location, togo) < Ship.size / 2 || player.location.y > Player.playerY) {
                player.location.x = togo.x;
                player.location.y = togo.y;
                player.moveState = PlayerMoveState.playerControl;
            }
        } else if (player.moveState == PlayerMoveState.moveToSpot) { // move to the playerMove spot
            let index = Player.getPlayerIndex(player);
            if (index == 0) {
                player.location.x += ((player.location.x > Player.safeX ? -elapsedTime : elapsedTime) / 1000);
            } else {
                player.location.x = Player.players[index - 1].location.x + (2 * Ship.size + 5);
            }
        }
        //Bounds check

        let index = Player.getPlayerIndex(player);
        player.location.x = Math.max(player.location.x, (Ship.size + 0.01) * (index + 1)); // Left side
        player.location.x = Math.min(player.location.x, 1 - ((Ship.size + 0.01) * (Player.players.length - index))); //Right side

    }

    public static renderPlayer() {
        for (let playerI in Player.players) {
            let player = Player.players[playerI];
            if (player.spawnProtection > 0) {
                Renderer.fillCircle(player.location.x, player.location.y, Ship.size, "rgba(0,140,0,1)");
            }
            Renderer.drawImage(Player.playerImage, player.location.x, player.location.y, Ship.size, Ship.size, player.rotation - Math.PI / 2);
        }
        let size = 0.02;
        for (let i = 0; i < Player.lives; i++) {
            Renderer.drawImageRaw(Player.playerImage, ((size) * i), 1 - size, size, size);
            if (Player.newLife && i == (Player.lives - 1)) {
                Player.newLife = false;
                ParticleSystem.lifeGained(((size * 1.5) * i), 1 - size);
                ScreenText.addText("1UP", 0.5, 0.1, 30, 3000, 'rgba(0,255,100,1)');
            }
        }
        for (let badI in Player.bounds) {
            let bad = Player.bounds[badI];
            Renderer.drawLine(`rgba(255,${(254 * (bad.distance / (0.5)))},0,0.4)`, bad.l, Player.playerY, bad.u, Player.playerY);
            if (Player.safeX > bad.l && Player.safeX < bad.u) {
                Player.safeX = Math.abs(Player.safeX - bad.l) < Math.abs(Player.safeX - bad.u) ?
                    bad.l :
                    bad.u;
            }
        }

        if (Player.isGameOver) {
            Player.gameOver();
        }
    }


    public static fireMissile() {
        for (let playerI in Player.players) {
            let player = Player.players[playerI];
            if (player.projectiles > 0 && player.projectileQueue &&
                (player.moveState == PlayerMoveState.playerControl || player.moveState == PlayerMoveState.moveToSpot)) {
                Utils.burstPlay(Assets.playerLaser, 0.4);
                player.projectileQueue = false;
                Projectiles.makeProjectile(Math.PI / 2, player.location, player, Player.colors[Player.shots % Player.colors.length], Player.target?.location);
                player.projectiles--;
                Player.missileWasFired();
            }
        }
    }

    public static reset() {
        Player.players = [new PlayerShip()];
    }

    public static missileWasFired() {
        Player.shots++;
    }

    public static updateAccuracy(): number {
        let temp = Player.waveHits;
        Player.waveHits = 0;
        return temp;
    }

    public static additionalFighter(x: number, y: number) {
        let newp = new PlayerShip();
        newp.location.x = x;
        newp.location.y = y;
        newp.moveState = PlayerMoveState.returnToPlayer;
        Player.players.push(newp);
    }
};