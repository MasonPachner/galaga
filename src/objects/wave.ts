import { WaveGenerator } from "../systems/predefined_waves";
import { ScreenText } from "../systems/screen-text";
import { Utils } from "../systems/utils";
import { Enemies } from "./enemies";

export class Wave {
    private static wave: any = {};
    private static breath = 6000;
    private static waveOffset = 0;
    private static waveDirection = 1;
    private static ROWS = 5;
    private static COLS = 10;
    private static center: any = {};
    public static level = 1;
    public static waveLoc: any = [];
    private static pause = 0;
    private static launchNextGroup = false;
    private static launchedGroup = 0;
    public static challengeLevelCount = 0;

    private static resetLocations() {
        Wave.waveLoc = [];
        for (let i = 0; i < Wave.ROWS; i++) {
            let next: any = [];
            for (let j = 0; j < Wave.COLS; j++) {
                next.push({
                    x: (0.25) + j * ((0.5) / (Wave.COLS - 1)),
                    y: 0.066 + i * ((0.2) / (Wave.ROWS - 1)),
                });
            }
            Wave.waveLoc.push(next);
        }
        Wave.center = {
            x: 0.5,
            y: 0.05,
        };
    }


    /**
     * Update function for a wave, moves all enemies and does location grid permutations
     */
    public static update(elapsedTime) {
        if (Wave.pause <= 0 && Wave.wave.groups != undefined) {
            if (Wave.launchNextGroup) {
                let launched = true;
                for (let enemyI in Wave.wave.groups[Wave.launchedGroup]) {
                    let enemy = Wave.wave.groups[Wave.launchedGroup][enemyI];
                    if (enemy.moveState <= 0 && !enemy.dirty) {
                        launched = false;
                    }
                    if (enemy.moveState == -1) {
                        enemy.moveState = 0;
                    }
                }
                if (launched) {
                    Wave.launchedGroup++;
                    if (Wave.launchedGroup >= Wave.wave.groups.length) {
                        Wave.launchNextGroup = false;
                    }
                }
            }
            if (Wave.wave.state == 0) {
                Wave.wave.state = Math.floor(Math.random() * 2) + 1;
                Wave.waveOffset = 0;
                Wave.resetLocations();
            } else if (Wave.wave.state == 1) {
                Wave.breathe(elapsedTime);
            } else if (Wave.wave.state == 2) {
                Wave.shake(elapsedTime);
            }
        } else {
            Wave.pause = Wave.pause - elapsedTime;
        }
    }


    /**
     * Note- This spreads and retracts the enemy location grid, does not get force reset until end of level
     * Relies of float mathmatics to stay consistent.
     */
    public static breathe(elapsedTime) {
        Wave.waveOffset += elapsedTime;
        for (let i = 0; i < Wave.ROWS; i++) {
            for (let j = 0; j < Wave.COLS; j++) {
                let power = Utils.distBetween(Wave.waveLoc[i][j], Wave.center) / 1500;

                if (Wave.waveOffset > Wave.breath) {
                    if (Wave.waveOffset > Wave.breath * 2) {
                        Wave.wave.state = 0;
                    }
                    power = -power;
                }
                Wave.waveLoc[i][j].x += Wave.center.x > Wave.waveLoc[i][j].x ? -power : power;
                Wave.waveLoc[i][j].y += power / 2;
            }
        }
    }

    /**
     * Note- This shuffles the enemy location grid, does not get force reset until end of level
     * Relies of float mathmatics to stay consistent.
     */
    public static shake(elapsedTime) {
        Wave.waveOffset += elapsedTime;
        if (Wave.waveLoc[Wave.ROWS - 1][Wave.COLS - 1].x > .999) {
            Wave.waveDirection = -1;
        }
        if (Wave.waveLoc[0][0].x < 0.01) {
            Wave.waveDirection = 1;
        }
        for (let i = 0; i < Wave.ROWS; i++) {
            for (let j = 0; j < Wave.COLS; j++) {
                Wave.waveLoc[i][j].x += elapsedTime * Wave.waveDirection / 10000;
            }
        }
        if (Wave.waveOffset > Wave.breath && (Math.abs((Wave.waveLoc[Wave.ROWS - 1][Wave.COLS - 1].x + Wave.waveLoc[0][0].x) / 2 - (0.5)) < 0.01)) {
            Wave.wave.state = 0;
        }
    }

    /**
     * Resets all data, for game over and end of attract mode
     */
    public static reset() {
        Enemies.enemies.length = 0;
    }

    public static waveList = [
        WaveGenerator.wave1,
        WaveGenerator.wave2,
        WaveGenerator.wave3,
    ];
    /**
     * Sets the next level
     */
    public static levelUp(inLevel: number) {
        Wave.resetLocations();
        let STARTWAVE = 0;
        Wave.level = inLevel + STARTWAVE;
        if (Wave.isChallengeLevel()) {
            ScreenText.addText("Challenge Level", 0.5, 0.5, 30, 3000, 'rgba(255,34,34,1)');
            Wave.pause = 3000;
        } else {
            ScreenText.addText(`Level ${Wave.level}`, 0.5, 0.5, 30, 3000, 'rgba(255,34,34,1)');
            Wave.pause = 3000;
        }
        Enemies.setLevel(Wave.level);
        Enemies.attackers = 0;
        //if (level > 3) {
        Wave.wave = WaveGenerator.randomWave(Wave.COLS, Wave.ROWS);
        //} else {
        //    wave = waveList[(level - 1) % waveList.length](enemies, COLS, ROWS); // No longer using predefined waves, only random
        //}
        Utils.shuffle(Wave.wave.groups);
        Wave.launchNextGroup = true;
        Wave.launchedGroup = 0;
        if (Wave.level >= 4) {
            Enemies.enemies[Math.floor(Math.random() * Enemies.enemies.length)].transformer = true;
        }
        if (Wave.isChallengeLevel()) {
            Wave.challengeLevelCount++;
        }
    }

    // This might not be true? Something about every 7 levels?
    public static isChallengeLevel() {
        return (Wave.level == 3) || (Wave.level > 5 && (Wave.level) % 4 == 3);
    }
}