import { Ship } from "../objects/ship";
import { Assets } from "./assets";
import { Location } from "./location";

export class Utils {
    public static get canvas(): HTMLCanvasElement | undefined {
        const element = document.getElementById('id-canvas');
        return element ? element as HTMLCanvasElement : undefined;
    };

    public static distBetweenWithWrapping(loc1: Location, loc2: Location) {
        let dx = loc2.x - loc1.x;
        let dy = loc2.y - loc1.y;
        if (Utils.canvas != undefined) {
            if (dx > (Utils.canvas.width * 0.5)) {
                dx = Utils.canvas.width - dx;
            }
            if (dy > (Utils.canvas.height * 0.5)) {
                dy = Utils.canvas.height - dy;
            }
        }
        return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
    }

    public static distBetween(loc1: Location, loc2: Location) {
        let dx = loc2.x - loc1.x;
        let dy = loc2.y - loc1.y;
        return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
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
    public static burstPlay(audio: string, volume: number = 1) {
        Assets.audio.get(audio)!.play();
    }
    public static safePlay(audio: string) {
        var playPromise = Assets.audio.get(audio)!.play();
        if (playPromise !== undefined) {
            playPromise.then(() => { }).catch((error: any) => {
                //safePlay(audio);
            });
        }
    }

    public static closestObjectDistance(loc1: Location, list: Ship[]) {
        let closest = Infinity;
        list.forEach(element => {
            closest = Math.min(closest, Utils.distBetweenWithWrapping(loc1, element.location));
        });
        return closest;
    }


    public static loadAudio() {
        // Assets.audio.get('playerLaser')!.volume = 0.4;
        // Assets.audio.get('playerExplosion')!.volume = 0.8;
        //MyGame.assets.enemyExplosion.volume =0.5;
        // Assets.audio.get('tractorBeam')!.volume = 0.5;
        // Assets.audio.get('enemyLaser')!.volume = 1;
        // Assets.audio.get('music')!.volume = 0.9;
    }
}