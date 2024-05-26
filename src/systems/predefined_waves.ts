import { Enemies } from "../objects/enemies";
import { EnemyParams, EnemyShip } from "../objects/enemy/enemyship";
import { Wave } from "../objects/wave";
import { BezierCurve, Path, PathType, TypedBezier } from "./paths";

type EnemyConstructor = (a: EnemyParams) => EnemyShip;
export enum WaveState {
    Stationary = "stationary", //0
    Breath = "breath", //1
    Shake = "shake", //2
}
export interface WaveGroup {
    groups: EnemyShip[][];
    state: WaveState;
    attack: boolean;
}


export class WaveGenerator {
    private static groupID: number = 0;

    public static wave1(): WaveGroup {
        let groups: EnemyShip[][] = [];
        let group: EnemyShip[] = [];
        for (let i = 0; i < 6; i++) {
            group.push(Enemies.makeButterfly({
                formationLocation: {
                    y: 1,
                    x: 2 + i,
                },
                delay: 1000 + (i * 300),
                formationEntrance: Path.topLeftSweep,
            }));
        }
        groups.push(group);

        group = [];
        for (let i = 0; i < 12; i++) {
            group.push(Enemies.makeBee({
                formationLocation: {
                    x: 2 + i % 6,
                    y: 2 + Math.floor(i / 6),
                },
                delay: 5000 + (Math.floor(i / 2) * 300),
                formationEntrance: i % 2 == 0 ? Path.topLeftSweep : Path.topRightSweep,
            }));
        }
        groups.push(group);

        group = [];
        for (let i = 0; i < 4; i++) {
            group.push(Enemies.makeBoss({
                formationLocation: {
                    x: 3 + i,
                    y: 0,
                },
                delay: 10000 + (i * 300),
                formationEntrance: i % 2 == 0 ? Path.bottomRightLoop : Path.bottomLeftLoop,
            }));
        }
        groups.push(group);
        return  {
            state: WaveState.Stationary,
            attack: false,
            groups: groups,
        };
    }
    public static wave2() :WaveGroup{
        let groups: EnemyShip[][] = [];
        let group: EnemyShip[] = [];
        for (let i = 0; i < 8; i++) {
            group.push(Enemies.makeBee({
                formationLocation: {
                    y: 1,
                    x: 1 + i,
                },
                delay: (i * 300),
                formationEntrance: Path.topLeftSweep,
            }));
        }
        groups.push(group);

        group = [];
        for (let i = 0; i < 20; i++) {
            group.push(Enemies.makeButterfly({
                formationLocation: {
                    x: i % 10,
                    y: 3 + Math.floor(i / 10),
                },
                delay: (Math.floor(i / 2) * 300),
                formationEntrance: i % 2 == 0 ? Path.bottomRightLoop : Path.bottomLeftLoop,
            }));
        }
        groups.push(group);

        group = [];
        let pathToUse = Path.topRightSweep.splitPath(20);
        for (let i = 0; i < 6; i++) {
            group.push(Enemies.makeBoss({
                formationLocation: {
                    x: 2 + i,
                    y: 0,
                },
                delay: Math.floor(i / 2) * 300,
                formationEntrance: i % 2 == 0 ? pathToUse[0] : pathToUse[1],
            }));
        }
        groups.push(group);

        return {
            state: WaveState.Stationary,
            attack: false,
            groups: groups,
        };
    }
    public static wave3() :WaveGroup{

        let groups: EnemyShip[][] = [];

        let group: EnemyShip[] = [];
        for (let i = 0; i < 20; i++) {
            group.push(Enemies.makeButterfly({
                formationLocation: {
                    x: i,
                    y: 1,
                },
                delay: (Math.floor(i / 2) * 300),
                formationEntrance: i % 2 == 0 ? Path.challengeLeftLoop : Path.challengeRightLoop,
            }));
        }
        group = [];
        for (let i = 0; i < 20; i++) {
            group.push(Enemies.makeBee({
                formationLocation: {
                    x: i,
                    y: 2,
                },
                delay: (Math.floor(i / 2) * 300),
                formationEntrance: i % 2 == 0 ? Path.challengeLeftSweep : Path.challengeRightSweep,
            }));
        }
        groups.push(group);
        return  {
            state: WaveState.Stationary,
            attack: false,
            groups : groups,
        };;
    }

    public static getPath(index: number, path: TypedBezier, pathType: PathType): BezierCurve {
        if (path.curves instanceof Array) {
            return path.curves[Math.abs(index % 2)];
        }
        return path.curves;
    }
    public static getDelay(index: number, pathType: PathType, groupCount: number): number {
        if (pathType == PathType.double) {
            return Math.floor((groupCount % 2 == 0 ? index + 1 : index) / 2) * 300;
        }
        if (pathType == PathType.alt) {
            return Math.floor((groupCount % 2 == 0 ? index + 1 : index) / 2) * 300;
        }
        return index * 300;
    }
    public static getId(index: number, pathType: PathType, initialId: number): number {
        if (pathType == PathType.double) {
            return (index % 2) * 60 + initialId;
        }
        if (pathType == PathType.alt) {
            return (index % 2) * 60 + initialId;
        }
        return initialId;
    }
    public static randomWave(width: number, height: number) :WaveGroup{
        let groupCount = 5;
        let groups: EnemyShip[][] = [];

        let enemyTypes: (EnemyConstructor)[] = [
            Enemies.makeBoss,
            Enemies.makeButterfly, Enemies.makeButterfly,
            Enemies.makeBee, Enemies.makeBee,
        ];

        for (let i = 0; i < groupCount; i++) {
            const paths = Path.getPathOptions(Wave.isChallengeLevel());
            const path: TypedBezier = paths[Math.floor(Math.random() * paths.length)]; // What path set to choose from
            let group: EnemyShip[] = [];
            // let enemyType = enemyTypes[Math.floor(Math.random()*enemyTypes.length)]; // Pick a random enemy
            let enemyType = enemyTypes[i];
            let spec: any = {};
            if (Wave.isChallengeLevel()) {
                if (Math.random() > 0.7) {
                    enemyType = Enemies.makeChallengeUnit;
                    spec.imageType = Math.floor(Math.random() * 3);
                }
            }
            let init = WaveGenerator.getGroupID();
            let groupCount = Math.floor(Math.random() * ((width - 4) / 2)) + (Wave.isChallengeLevel() ? 3 : 2); // Pick how many enemies, min = 2
            let ordering = [4, 5];
            for (let j = 2; j <= groupCount; j++) {
                ordering.unshift(ordering[ordering.length - 1] + j - 1);
                ordering.unshift(ordering[ordering.length - 2] - j + 1);
            }
            for (let j = Math.floor(width / 2) - groupCount; j < (width / 2) + groupCount; j++) {
                spec.groupID = WaveGenerator.getId(j, path.type, init);
                spec.delay = WaveGenerator.getDelay(j, path.type, groupCount);
                spec.formationEntrance = WaveGenerator.getPath(j, path, path.type);
                spec.speed = Wave.isChallengeLevel() ? 6000 : 3000;
                spec.formationLocation = {
                    y: i,
                    x: Wave.isChallengeLevel() ? 1 : ordering[j - (Math.floor(width / 2) - groupCount)],
                };
                group.push(enemyType(spec as EnemyParams));
            }
            groups.push(group);
        }
        return  {
            state: WaveState.Stationary,
            attack: false,
            groups: groups,
        };
    }
    public static getGroupID(): number {
        if (WaveGenerator.groupID > 50) { // Shouldn't need more than 6.
            WaveGenerator.groupID = 0;
        }
        return ++WaveGenerator.groupID;
    }
};