import { Assets } from "./assets";
import { Location } from "./location";

export class Utils {
    public static canvas: any = document.getElementById('id-canvas');
    private static DIRECTIONS: any = {
        UP: "UP",
        DOWN: "DOWN",
        LEFT: "LEFT",
        RIGHT: "RIGHT",
    };

    public static distBetween(loc1: Location, loc2: Location) {
        let dx = loc2.x - loc1.x;
        let dy = loc2.y - loc1.y;
        if (dx > Utils.canvas.width * 0.5) {
            dx = Utils.canvas.width - dx;
        }
        if (dy > Utils.canvas.height * 0.5) {
            dy = Utils.canvas.height - dy;
        }
        return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    }

    public static wrapLocation(location: Location) {
        if (location.x < -5) {
            location.x = Utils.canvas.width;
        }
        if (location.y < -5) {
            location.y = Utils.canvas.height;
        }
        if (location.x >= Utils.canvas.width + 5) {
            location.x = 0;
        }
        if (location.y >= Utils.canvas.height + 5) {
            location.y = 0;
        }
    }

    public static angleBetween(loc1: Location, loc2: Location) {
        return Math.atan2(
            (loc2.y - loc1.y),
            (loc2.x - loc1.x)
        );
    }

    public static cycle(radian: number) {
        let returnRadian = radian;
        if (radian > Math.PI * 2) {
            returnRadian -= Math.PI * 2;
        }
        if (radian < 0) {
            returnRadian += Math.PI * 2;
        }
        return returnRadian;
    }

    public static bound(int: number, limit: number) {
        int = Math.min(int, limit);
        int = Math.max(int, -limit);
        return int;
    }

    public static pickStartLocation(direction: number) {
        let options = [Math.cos(direction) > 0 ? Utils.DIRECTIONS.LEFT : Utils.DIRECTIONS.RIGHT, Math.sin(direction) > 0 ? Utils.DIRECTIONS.DOWN : Utils.DIRECTIONS.UP];
        let side = options[Math.floor(Math.random() * options.length)];
        let x = -1;
        let y = -1;
        if (side == Utils.DIRECTIONS.RIGHT) {
            x = Utils.canvas.width;
            y = Math.random() * Utils.canvas.height;
        } else if (side == Utils.DIRECTIONS.LEFT) {
            x = 0;
            y = Math.random() * Utils.canvas.height;
        } else if (side == Utils.DIRECTIONS.DOWN) {
            x = Math.random() * Utils.canvas.width;
            y = Utils.canvas.height;
        } else { //UP
            x = Math.random() * Utils.canvas.width;
            y = 0;
        }
        return {
            x: x,
            y: y
        };
    }

    //https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    public static shuffle<T>(array: T[]) {
        var currentIndex = array.length,
            temporaryValue, randomIndex;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }
    //________________________________________________________________________________________

    public static safePlay(audio: any) {
        var playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then((e: Event) => { }).catch((error: any) => {
                //safePlay(audio);
            });
        }
    }

    public static closestObjectDistance(loc1: Location, list: any[]) {
        let closest = Infinity;
        list.forEach(element => {
            closest = Math.min(closest, Utils.distBetween(loc1, element.location));
        });
        return closest;
    }


    public static loadAudio() {
        Assets.assets.playerLaser.volume = 0.4;
        Assets.assets.playerExplosion.volume = 0.8;
        //MyGame.assets.enemyExplosion.volume =0.5;
        Assets.assets.tractorBeam.volume = 0.5;
        Assets.assets.enemyLaser.volume = 1;
        Assets.assets.music.volume = 0.9;
    }
}