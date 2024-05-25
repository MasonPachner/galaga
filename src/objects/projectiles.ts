import { Assets } from "../systems/assets";
import { ParticleSystem } from "../systems/particle-system";
import { Renderer } from "../systems/renderer";
import { Utils } from "../systems/utils";

export class Projectiles {
    public static proj: any = [];

    public static playerProjectile = Assets.assets.playerPro;

    public static enemyProjectile = Assets.assets.enemyPro;

    public static makeProjectile(direction, inlocation, owner, playerDamage, color, target) {
        let project: any = {
            owner: owner,
            dirty: false,
            playerProjectile: !playerDamage,
            speed: (playerDamage ? 0.4 : 1) * 0.0007,
            rotation: direction,
            lifespan: 7000,
            color: color,
            size: 0.005,
            beam: false,
            playerDamage: playerDamage,
            location: {
                x: Math.cos(direction) * owner.size + inlocation.x,
                y: Math.sin(direction) * owner.size + inlocation.y,
            },
            updateLocation: function (elapsedTime) {
                let prevY = this.location.y;
                this.location.x -= Math.cos(this.rotation) * this.speed * elapsedTime;
                this.location.y -= Math.sin(this.rotation) * this.speed * elapsedTime;
                if (this.target != null && this.location.y >= this.target.y && prevY <= this.target.y) { //Bullet paper check
                    this.missDist = this.target.y - this.location.x;
                }
            },
            handleDirty: function () {
                owner.returnMissile();
            },
        };
        project.missDist = 0;
        if (target != null) {
            project.target = { x: target.x, y: target.y };
            project.range = Math.tan((project.rotation - Math.PI) - Math.PI / 2);
        }
        Projectiles.proj.push(project);
    }


    public static makeBeam(direction, inlocation, owner, arcSize, group) {
        let project = {
            owner: owner,
            dirty: false,
            playerProjectile: false,
            speed: 0.0001,
            rotation: direction + Math.PI,
            lifespan: 7000,
            strokeSize: 0.002,
            size: 0.005,
            beam: true,
            color: owner.projectiles % 2 == 0 ? "rgba(0,0,255,1)" : "rgba(255,255,255,1)",
            playerDamage: true,
            arcSize: arcSize,
            group: group,
            location: {
                x: Math.cos(direction) * owner.size + inlocation.x,
                y: Math.sin(direction) * owner.size + inlocation.y,
            },
            collidingWithPlayer: function (playerLocation, playerSize) { // each arc has 10 points that we check for collisions on. could be better
                let COLLISION_POINTS = 10;
                if (owner.dirty || owner.ownsAShip || owner.moveState != 5) {
                    this.dirty = true;
                    return false;
                }
                for (let i = 0; i < COLLISION_POINTS; i++) {
                    let arcChange = i * this.arcSize / COLLISION_POINTS;
                    if (Utils.distBetween(playerLocation,
                        {
                            x: this.location.x + Math.cos(this.rotation - (this.arcSize / 2) + arcChange) * this.size,
                            y: this.location.y + Math.sin(this.rotation - (this.arcSize / 2) + arcChange) * this.size,
                        }) <= this.strokeSize + playerSize) {
                        owner.ownsAShip = true;
                        return true;
                    }
                }
                return false;
            },
            updateLocation: function (elapsedTime) {
                this.size += this.speed * elapsedTime * (owner.tractorExpand ? 1 : -1);
                if (this.size < 0.0001)
                    this.dirty = true;
                if (this.location.y + this.size > 1)
                    this.dirty = true;

            },
            handleDirty: function () {
                //console.log("Beam Hit");
            },
        };
        Projectiles.proj.push(project);
    }
    public static renderProjectiles() {
        Projectiles.proj.forEach((e) => {
            if (!e.beam) {
                Renderer.drawImage(e.playerDamage ? Projectiles.playerProjectile : Projectiles.enemyProjectile,
                    e.location.x,
                    e.location.y,
                    e.size, e.size,
                    e.rotation - Math.PI / 2);
                // if(e.playerDamage)
                //     MyGame.renderer.drawLine('rgba(255,255,0,1)', e.location.x,
                //     e.location.y,e.target.x,e.target.y);
            } else {
                Renderer.strokeArc(e.color,
                    e.location.x,
                    e.location.y,
                    e.arcSize,
                    e.strokeSize,
                    e.size,
                    e.rotation);
                // MyGame.renderer.fillCircle(
                //     e.location.x,
                //     e.location.y,
                //     e.size,
                //     e.color);
            }
        });
    }

    public static update(elapsedTime) {
        Projectiles.proj.forEach(pro => {
            pro.updateLocation(elapsedTime);
            if (pro.location.y < 0 || pro.location.y > 1) {
                pro.dirty = true;
            } else if (!pro.beam) {
                ParticleSystem.projectileThrust(
                    pro.location.x + Math.cos(pro.rotation) * pro.size / 2,
                    pro.location.y + Math.sin(pro.rotation) * pro.size / 2,
                    { direction: pro.rotation, range: Math.PI / 18 },
                    pro.color);
            }
        });
        Projectiles.clean();
    }
    public static clean() {
        let cleanProj: any = [];
        Projectiles.proj.forEach(e => {
            if (!e.dirty) {
                cleanProj.push(e);
            } else {
                e.handleDirty();
            }
        });
        Projectiles.proj = cleanProj;
    }
    public static beamGroup(request) {
        let group: any = [];
        Projectiles.proj.forEach(e => {
            if (e.beam && e.group == request) {
                group.push(e);
            }
        });
        return group;
    }

    public static reset() {
        Projectiles.proj.length = 0;
    }
}