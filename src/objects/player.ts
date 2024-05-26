import { Persitence } from "../screens/galaga";
import { Assets } from "../systems/assets";
import { ParticleSystem } from "../systems/particle-system";
import { Renderer } from "../systems/renderer";
import { ScreenText } from "../systems/screen-text";
import { Utils } from "../systems/utils";
import { Enemies } from "./enemies";
import { EnemyMoveState } from "./enemy/enemyship";
import { PlayerMoveState, PlayerShip } from "./playership";
import { Projectiles } from "./projectiles";
import { Ship } from "./ship";

export interface Bounds {
    l: number,
    u: number,
    loc: number,
    distance: number,
}

export class Player {

    public static playerY = 0.90;
    public static attackDelay = 300;
    public static lives = 2;
    public static playerImage() {
        return Assets.assets.fighter;
    }
    public static players: PlayerShip[] = [new PlayerShip()];
    public static newLife = false;
    public static shots = 0;
    public static totalHits = 0;
    public static isGameOver = false;
    public static lastLoc: any = null;
    public static bounds: Bounds[] = [];
    public static nextLife = 20000;
    public static thrust: any = [];
    public static target: any = null;
    public static size = Player.players[0].size;
    public static colors = ['rgba(255,255,0,1)', 'rgba(255, 0, 0,1)', 'rgba(255, 0, 255,1)', 'rgba(0, 0, 255,1)', 'rgba(0, 255, 255,1)', 'rgba(0, 255, 0,1)'];
    public static dontBounce = 400;
    public static safeX = 0;
    public static attract = false;



    public static inputMove(num: number) {
        if (!Player.attract)
            Player.thrust.push(num);
    }
    public static inputShoot() {
        if (!Player.attract)
            Player.fireMissile();
    }

    public static update(elapsedTime: number, score: number) {
        if (Player.attract) {
            if (Player.target != null)
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
                player.attackDelay = Player.attackDelay;
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
        let clean: any = [];
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
            if (pro.playerDamage && (pro.location.y < (Player.playerY + Player.size * 2))) {
                if (!pro.beam) {
                    Player.bounds.push({
                        l: pro.target.x - (Math.abs(pro.range) + Player.size * 1.5),
                        u: pro.target.x + Math.abs(pro.range) + Player.size * 1.5,
                        loc: pro.target.x,
                        distance: Math.abs(pro.location.y - Player.playerY)
                    });
                } else {
                    let diff = Math.abs(Math.cos(pro.rotation - (pro.arcSize / 2)) * pro.size);
                    Player.bounds.push({
                        l: pro.location.x - diff - Player.size * 2.5,
                        u: pro.location.x + diff + Player.size * 2.5,
                        loc: pro.location.x,
                        distance: Math.abs(Player.playerY - (pro.location.y + pro.size))
                    });
                }
            }

        }
        //Calculate bad zones -enemies
        for (let enemyI in Enemies.enemies) {
            let enemy = Enemies.enemies[enemyI];
            if (enemy.location.y > 0.6 && (enemy.moveState == 3 || enemy.moveState == 5)) { // Don't get hit by badguys
                Player.bounds.push({
                    l: enemy.location.x - (enemy.size + Player.size * 2.5),
                    u: enemy.location.x + enemy.size + Player.size * 2.5,
                    loc: enemy.location.x,
                    distance: Math.abs(Player.players[0].location.y - enemy.location.y) / 2
                });
            }

        }

        // Find an enemy to attack
        if (Enemies.enemies.length == 0) { //Nobody to shoot
            Player.safeX = 0.5;
        } else {
            if (Player.target == null || Player.target.dirty) {
                Player.lastLoc = null;
                Player.target = Enemies.enemies[Math.floor(Math.random() * Enemies.enemies.length)];
            }
            if (Player.target.location.y > 2) {
                Player.target = null;
                Player.lastLoc = null;
            } else {
                Player.safeX = Player.target.location.x;
                if (Player.lastLoc != null) {
                    let offset = (Player.target.location.x - Player.lastLoc.x) * ((Player.players[0].location.y - Player.lastLoc.y) / 11); // Try to aim where the target is gonna be
                    Player.safeX = Player.safeX + offset;
                }
            }
        }
        if (Player.target != null && Player.dontBounce < 0) {
            Player.lastLoc = {
                x: Player.target.location.x,
                y: Player.target.location.y,
            };
            //dontBounce = 400;
        } else {
            Player.dontBounce -= elapsedTime;
        }

        if (Player.bounds.length > 0) {
            let best = 1;
            let bestLoc = Player.safeX;
            let low = 0;
            let high = 1;
            let lowDanger = 0;
            let highDanger = 0;
            for (let badI in Player.bounds) {
                let bad = Player.bounds[badI];
                if (bad.l < 0.001 || (bad.distance < Player.size * 3 && bad.loc < Player.players[0].location.x)) {
                    bad.l = -1;
                }
                if (bad.u > 0.999 || (bad.distance < Player.size * 3 && bad.loc >= Player.players[0].location.x)) {
                    bad.u = 2;
                }
                if (bad.distance < Player.size * 2 && bestLoc < bad.u && bestLoc > bad.l) {
                    let distLo = Math.abs(Player.players[0].location.x - bad.l);
                    let distHi = Math.abs(Player.players[0].location.x - bad.u);
                    if (distLo < best && bad.l >= low) {
                        best = distLo;
                        bestLoc = bad.l;
                        if (high > bad.l) {
                            high = bad.l;
                            if (bad.distance > highDanger)
                                highDanger = bad.distance;
                        }
                    }
                    if (distHi < best && bad.u <= high) {
                        best = distHi;
                        bestLoc = bad.u;
                        if (low < bad.u) {
                            low = bad.u;
                            if (bad.distance > lowDanger)
                                lowDanger = bad.distance;
                        }
                    }
                }
            }
            Player.safeX = bestLoc;
            if (low >= high) { // Probs gonna die. Try to run away
                Player.safeX = lowDanger < highDanger ? 0 : 1; //smaller number = more danger
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
            if (Utils.distBetween(player.location, player.beamData.location.y) < player.size || player.location.y > Player.playerY) {
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
                x: Player.players[0].location.x + (2 * Player.size) * (index),
                y: Player.playerY,
            };
            let rotation = Utils.angleBetween(player.location, togo);
            player.location.x += Math.cos(rotation) * elapsedTime / 7000;
            player.location.y += Math.sin(rotation) * elapsedTime / 7000;
            if (Utils.distBetween(player.location, togo) < player.size / 2 || player.location.y > Player.playerY) {
                player.location.x = togo.x;
                player.location.y = togo.y;
                player.moveState = PlayerMoveState.playerControl;
            }
        } else if (player.moveState == PlayerMoveState.moveToSpot) { // move to the playerMove spot
            let index = Player.getPlayerIndex(player);
            if (Math.abs(Player.players[0].location.x - Player.safeX) < player.size / 2) {
                player.location.x = Player.safeX + (2 * player.size) * (index);
            } else if (index == 0) {
                player.location.x += ((player.location.x > Player.safeX ? -elapsedTime : elapsedTime) / 1000);
            } else {
                player.location.x = Player.players[index - 1].location.x + (2 * player.size + 5);
            }
        }
        //Bounds check

        let index = Player.getPlayerIndex(player);
        player.location.x = Math.max(player.location.x, (player.size + 0.01) * (index + 1)); // Left side
        player.location.x = Math.min(player.location.x, 1 - ((player.size + 0.01) * (Player.players.length - index))); //Right side

    }

    public static renderPlayer() {
        for (let playerI in Player.players) {
            let player = Player.players[playerI];
            if (player.spawnProtection > 0) {
                Renderer.fillCircle(player.location.x, player.location.y, player.size, "rgba(0,140,0,1)");
            }
            Renderer.drawImage(Player.playerImage, player.location.x, player.location.y, player.size, player.size, player.rotation - Math.PI / 2);
        }
        let size = 0.02;
        for (let i = 0; i < Player.lives; i++) {
            Renderer.drawImageRaw(Player.playerImage, ((size) * i), 1 - size, size, size);
            if (Player.newLife && i == Player.lives - 1) {
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
            if (player.projectiles > 0 && player.projectileQueue && (player.moveState == PlayerMoveState.playerControl || player.moveState == PlayerMoveState.moveToSpot)) {
                let v = Assets.assets.playerLaser.cloneNode();
                v.volume = 0.4;
                Utils.safePlay(v);
                player.projectileQueue = false;
                Projectiles.makeProjectile(Math.PI / 2, player.location, player, false, Player.colors[Player.shots % Player.colors.length], Player.target);
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

    public static updateAccuracy() {
        let temp = 0;
        for (let playerI in Player.players) {
            let player = Player.players[playerI];
            temp = temp + player.waveHits;
            player.waveHits = 0;
        }
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