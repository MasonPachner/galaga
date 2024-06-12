import { Player } from "../objects/player";
import { Ship } from "../objects/ship";
import { Location } from "./location";
import { Utils } from "./utils";


export enum Direction {
    left = -1,
    right = 1,
}

export enum PathType {
    single = "single",
    double = "double",
    alt = "alt",
}

export interface TypedBezier {
    curves: BezierCurve | [BezierCurve, BezierCurve],
    type: PathType,
    isChallenge: boolean,
}

export class BezierCurve {
    public path: Location[] = [];
    constructor(
        readonly interval: number,
        readonly p1: Location,
        readonly p2: Location,
        readonly p3?: Location,
        readonly p4?: Location,
        public duration?: number,
    ) {
        const p3Default = p3 ?? { x: 0, y: 0 };
        const p4Default = p4 ?? { x: 0, y: 0 };
        for (let i = 0; i <= interval; i++) {
            const t = i / interval;
            this.path.push({
                x: Math.pow((1 - t), 3) * p1.x + 3 * Math.pow((1 - t), 2) * t * p2.x + 3 * (1 - t) * Math.pow(t, 2) * p3Default.x + Math.pow(t, 3) * p4Default.x,
                y: Math.pow((1 - t), 3) * p1.y + 3 * Math.pow((1 - t), 2) * t * p2.y + 3 * (1 - t) * Math.pow(t, 2) * p3Default.y + Math.pow(t, 3) * p4Default.y,
            });
        }
    }


    public concat(next: BezierCurve) {
        this.path = [...this.path, ...next.path];
    }

    // Takes a path and splits each point into 2 points 2x(displacement) apart
    public splitPath(displacement: number): [BezierCurve, BezierCurve] {
        let pathA: Location[] = [];
        let pathB: Location[] = []
        for (let locIndex in this.path) {
            let loc = this.path[locIndex];
            if ((Number(locIndex) + 1) < this.path.length) {
                let parrallel = Utils.angleBetween(loc, this.path[Number(locIndex) + 1]);
                let deltaX = Math.cos(parrallel + Math.PI / 2) * displacement;
                let deltaY = Math.sin(parrallel + Math.PI / 2) * displacement;
                pathA.push({
                    x: loc.x + deltaX,
                    y: loc.y + deltaY,
                });
                pathB.push({
                    x: loc.x - deltaX,
                    y: loc.y - deltaY,
                });
            }
        }
        const a = new BezierCurve(1, { x: 0, y: 0 }, { x: 0, y: 0 });
        a.path = pathA;
        const b = new BezierCurve(1, { x: 0, y: 0 }, { x: 0, y: 0 });
        b.path = pathB;
        return [a, b];
    }
}

export class Path {
    public static topSweep(direction: Direction): BezierCurve {
        let centerX = 0.5;
        let centerY = 0.5;
        return new BezierCurve(
            700,
            {
                x: centerX + (direction * centerX / 2),
                y: 0,
            },
            {
                x: (1 - direction) * centerX,
                y: centerY,
            },
            {
                x: centerX + direction * centerX * 0.1,
                y: centerY * 2,
            },
            {
                x: centerX + direction * centerX * 0.1,
                y: centerY,
            },
        );
    }

    public static bottomLoop(direction: Direction): BezierCurve {
        let centerX = 0.5;
        let centerY = 0.5;
        const curve = new BezierCurve(
            300,
            {
                x: (1 + direction) * centerX, // -1 = left side, 1 = right side
                y: centerY * 1.65,
            },
            {
                x: centerX + direction * centerX * 0.1, // -1 = right side, 1 = left side
                y: centerY * 1.65,
            },
            {
                x: centerX + direction * centerX * 0.1, // -1 = left side, 1 = right side
                y: centerY * 1.4,
            },
            {
                x: centerX + direction * centerX * 0.1,
                y: centerY,
            },
        );
        curve.concat(new BezierCurve(
            500,
            {
                x: centerX + direction * centerX * 0.1, // -1 = left side, 1 = right side
                y: centerY,
            },
            {
                x: centerX + direction * centerX * 0.1, // -1 = right side, 1 = left side
                y: centerY / 2,
            },
            {
                x: centerX + (direction) * centerX * 0.5, // -1 = left side, 1 = right side
                y: centerY / 2,
            },
            {
                x: centerX + (direction) * centerX * 0.5,
                y: centerY,
            },
        ));
        curve.concat(new BezierCurve(
            500,
            {
                x: centerX + (direction) * centerX * 0.5,
                y: centerY,
            },
            {
                x: centerX + (direction) * centerX * 0.5, // -1 = right side, 1 = left side
                y: 0.75,
            },
            {
                x: centerX + direction * centerX * 0.1, // -1 = left side, 1 = right side
                y: 0.75,
            },
            {
                x: centerX + direction * centerX * 0.1,
                y: centerY,
            },
        ));
        return curve;
    }
    public static challengeLoop(direction: Direction): BezierCurve {
        let centerX = 0.5;
        let centerY = 0.5;
        let curve = new BezierCurve(
            400,
            {
                x: (1 + direction) * centerX,
                y: 0,
            },
            {
                x: centerX + direction * centerX * 0.1,
                y: centerY,
            },
        );
        curve.concat(new BezierCurve(
            400,
            {
                x: centerX + direction * centerX * 0.1,
                y: centerY,
            },
            {
                x: (1 - direction) * centerX,
                y: -0.05,
            },
        ));
        return curve;
    }
    public static challengeZigZag(direction: Direction): BezierCurve {
        const centerX = 0.5;
        const centerY = 0.5;
        const curve = new BezierCurve(
            400,
            {
                x: centerX + centerX * direction, // -1 = left side, 1 = right side
                y: centerY * 1.6,
            },
            {
                x: centerX + -1 * centerX * direction * 1.2, // -1 = left side, 1 = right side
                y: centerY * 1.6,
            },
            {
                x: centerX + centerX * direction, // -1 = left side, 1 = right side
                y: centerY * 1.6,
            },
            {
                x: centerX + centerX * direction * .8,
                y: centerY,
            },
        );
        curve.concat(new BezierCurve(
            400,
            {
                x: centerX + centerX * direction * .8,
                y: centerY,
            },
            {
                x: centerX + centerX * direction * .8, // -1 = right side, 1 = left side
                y: 0,
            },
            {
                x: centerX + direction * centerX * 0.1, // -1 = left side, 1 = right side
                y: 0,
            },
            {
                x: centerX + direction * centerX * 0.1,
                y: centerY,
            },
        ));
        curve.concat(new BezierCurve(
            400,
            {
                x: centerX + direction * centerX * 0.1,
                y: centerY,
            },
            {
                x: centerX + direction * centerX * -0.3, // -1 = right side, 1 = left side
                y: centerY,
            },
            {
                x: centerX + direction * centerX * -0.7, // -1 = left side, 1 = right side
                y: centerY,
            },
            {
                x: centerX + direction * centerX * -1.1,
                y: centerY,
            },
        ));
        return curve;
    }
    public static challengeSweep(direction: Direction): BezierCurve {
        let centerX = 0.5;
        let centerY = 0.5;
        let curve = new BezierCurve(
            400,
            {
                x: (direction) * centerX / 4 + centerX, // -1 = left side, 1 = right side
                y: 0,
            },
            {
                x: centerX + direction * centerX * 0.1, // -1 = right side, 1 = left side
                y: 1,
            },
            {
                x: (-direction) * centerX + centerX, // -1 = left side, 1 = right side
                y: centerY * 1.5,
            },
            {
                x: centerX + direction * centerX * 0.1,
                y: centerY,
            },
        );
        curve.concat(new BezierCurve(
            400,
            {
                x: centerX + direction * centerX * 0.1, // -1 = left side, 1 = right side
                y: centerY,
            },
            {
                x: centerX + direction * centerX * 0.3, // -1 = right side, 1 = left side
                y: centerY * 0.7,
            },
            {
                x: centerX + direction * centerX * 0.7, // -1 = left side, 1 = right side
                y: centerY * 0.3,
            },
            {
                x: direction * centerX + centerX,
                y: -0.05,
            },
        ));
        return curve;
    }
    public static tractorBeam(location: Location, playerLocation: Location): BezierCurve {
        return new BezierCurve(
            240,
            {
                x: location.x, // -1 = left side, 1 = right side
                y: location.y,
            },
            {
                x: location.x, // -1 = right side, 1 = left side
                y: location.y,
            },
            {
                x: playerLocation.x,
                y: playerLocation.y * 0.80,
            },
            {
                x: playerLocation.x,
                y: playerLocation.y * 0.80,
            },
            3000,
        );
    }
    public static attackVector(direction: Direction, location: Location): BezierCurve {
        let centerX = 0.5;
        let centerY = 0.5;
        const curve = new BezierCurve(
            170,
            {
                x: location.x, // -1 = left side, 1 = right side
                y: location.y,
            },
            {
                x: location.x, // -1 = right side, 1 = left side
                y: 0,
            },
            {
                x: direction * centerX / 4 + location.x, // -1 = left side, 1 = right side
                y: centerY,
            },
            {
                x: location.x,
                y: centerY,
            },
            3000
        );
        const curve2 = new BezierCurve(
            200,
            {
                x: location.x, // -1 = left side, 1 = right side
                y: centerY,
            },
            {
                x: -direction * centerX / 4 + location.x, // -1 = right side, 1 = left side
                y: centerY,
            },
            {
                x: -direction * centerX / 4 + location.x, // -1 = left side, 1 = right side
                y: centerY * 2.5,
            },
            {
                x: -direction * centerX / 8 + location.x,
                y: centerY * 2.5,
            },
        );
        curve2.path.slice(1);
        curve.concat(curve2);
        return curve;
    }
    public static attackSweep(direction: Direction, location: Location): BezierCurve {
        let centerX = 0.5;
        let centerY = 0.5;
        const curve = new BezierCurve(
            300,
            {
                x: location.x, // -1 = left side, 1 = right side
                y: location.y,
            },
            {
                x: direction * centerX * 0.8 + centerX, // -1 = right side, 1 = left side
                y: location.y,
            },
            {
                x: -direction * centerX * 0.8 + centerX, // -1 = left side, 1 = right side
                y: 0,
            },
            {
                x: -direction * centerX * 0.8 + centerX,
                y: centerY,
            },
            6000,
        );
        const curve2 = new BezierCurve(
            300,
            {
                x: -direction * centerX * 0.8 + centerX, // -1 = left side, 1 = right side
                y: centerY,
            },
            {
                x: -direction * centerX / 4 + centerX, // -1 = right side, 1 = left side
                y: centerY * 1.2,
            },
            {
                x: direction * centerX / 4 + centerX, // -1 = left side, 1 = right side
                y: centerY * 1.2,
            },
            {
                x: direction * centerX * 0.8 + centerX,
                y: centerY,
            },
        );
        curve2.path.slice(1);
        curve.concat(curve2);
        return curve;
    }
    // Bee attack vector, back and forth sweep, can do up to 2 loops around the player
    public static beeAttackVector(direction: Direction, location: Location): BezierCurve {
        let centerX = 0.5;
        let centerY = 0.5;
        let curve = new BezierCurve(
            230,
            {
                x: location.x, // -1 = left side, 1 = right side
                y: location.y,
            },
            {
                x: direction * centerX * 0.9 + centerX, // -1 = right side, 1 = left side
                y: location.y,
            },
            {
                x: direction * centerX * 0.9 + centerX, // -1 = left side, 1 = right side
                y: centerY,
            },
            {
                x: centerX,
                y: centerY,
            },
            6000,
        );
        curve.concat(new BezierCurve(
            230,
            {
                x: centerX,
                y: centerY,
            },
            {
                x: -direction * centerX * 0.9 + centerX, // -1 = right side, 1 = left side
                y: centerY,
            },
            {
                x: -direction * centerX * 0.9 + centerX, // -1 = left side, 1 = right side
                y: centerY * 1.99,
            },
            {
                x: centerX,
                y: centerY * 1.99,
            },
        ));
        curve.concat(new BezierCurve(
            170,
            {
                x: centerX,
                y: centerY * 2,
            },
            {
                x: direction * centerX * 0.9 + centerX, // -1 = right side, 1 = left side
                y: centerY * 1.95,
            },
            {
                x: direction * centerX * 0.9 + centerX, // -1 = left side, 1 = right side
                y: centerY * 1.95,
            },
            {
                x: direction * centerX * 0.9 + centerX,
                y: centerY,
            },
        ));
        let attacks = Math.floor(Math.random() * 3)
        if (attacks > 0) {
            const next = new BezierCurve(
                170,
                {
                    x: direction * centerX * 0.9 + centerX,
                    y: centerY,
                },
                {
                    x: direction * centerX * 0.9 + centerX, // -1 = right side, 1 = left side
                    y: 0,
                },
                {
                    x: -direction * centerX * 0.9 + centerX, // -1 = left side, 1 = right side
                    y: centerY * 1.95,
                },
                {
                    x: centerX,
                    y: centerY * 1.95,
                },
            );
            next.concat(new BezierCurve(
                170,
                {
                    x: centerX,
                    y: centerY * 1.95,
                },
                {
                    x: direction * centerX * 0.9 + centerX, // -1 = right side, 1 = left side
                    y: centerY * 1.95,
                },
                {
                    x: direction * centerX * 0.9 + centerX, // -1 = left side, 1 = right side
                    y: centerY * 1.95,
                },
                {
                    x: direction * centerX * 0.9 + centerX,
                    y: centerY,
                },
            ));
            for (let i = 0; i < attacks; i++) {
                curve.concat(next);
                curve.duration = (curve.duration ?? 0) + 4000;
            }
        }
        return curve;
    }


    public static readonly topLeftSweep = Path.topSweep(Direction.left);
    public static readonly topRightSweep = Path.topSweep(Direction.right);
    public static readonly bottomLeftLoop = Path.bottomLoop(Direction.left);
    public static readonly bottomRightLoop = Path.bottomLoop(Direction.right);
    public static readonly challengeLeftLoop = Path.challengeLoop(Direction.left);
    public static readonly challengeRightLoop = Path.challengeLoop(Direction.right);
    public static readonly challengeLeftSweep = Path.challengeSweep(Direction.left);
    public static readonly challengeRightSweep = Path.challengeSweep(Direction.right);
    public static readonly challengeLeftZag = Path.challengeZigZag(Direction.left);
    public static readonly challengeRightZag = Path.challengeZigZag(Direction.right);

    private static readonly ratio = 1.5;
    public static readonly typedBeziers = new Map<PathType, TypedBezier[]>([
        [PathType.alt,
        [{
            curves: [Path.challengeLeftLoop, Path.challengeRightLoop],
            type: PathType.alt,
            isChallenge: true,
        },
        {
            curves: [Path.challengeRightSweep, Path.challengeLeftSweep],
            type: PathType.alt,
            isChallenge: true,
        },
        {
            curves: [Path.challengeLeftZag, Path.challengeRightZag],
            type: PathType.alt,
            isChallenge: true,
        },
        {
            curves: [Path.topLeftSweep, Path.topRightSweep],
            type: PathType.alt,
            isChallenge: false,
        },
        {
            curves: [Path.bottomLeftLoop, Path.bottomRightLoop],
            type: PathType.alt,
            isChallenge: false,
        },]],
        [PathType.double, [
            ...[
                Path.challengeLeftLoop.splitPath(Ship.size*Path.ratio), Path.challengeRightLoop.splitPath(Ship.size*Path.ratio),
                Path.challengeLeftSweep.splitPath(Ship.size*Path.ratio), Path.challengeRightSweep.splitPath(Ship.size*Path.ratio),
                Path.challengeLeftZag.splitPath(Ship.size*Path.ratio), Path.challengeRightZag.splitPath(Ship.size*Path.ratio),
            ].map((path) => {
                return {
                    curves: path,
                    type: PathType.double,
                    isChallenge: true,
                };
            }),
            ...[
                Path.topLeftSweep.splitPath(Ship.size*Path.ratio), 
                Path.topRightSweep.splitPath(Ship.size*Path.ratio), 
                Path.bottomRightLoop.splitPath(Ship.size*Path.ratio), 
                Path.bottomLeftLoop.splitPath(Ship.size*Path.ratio),
            ].map((path) => {
                return {
                    curves: path,
                    type: PathType.double,
                    isChallenge: false,
                };
            }),
        ]],
        [PathType.single, [
            ...[
                Path.challengeLeftLoop, Path.challengeRightLoop, Path.challengeRightSweep, Path.challengeLeftSweep, Path.challengeLeftZag, Path.challengeRightZag,
            ].map((path) => {
                return {
                    curves: path,
                    type: PathType.single,
                    isChallenge: true,
                };
            }),
            ...[
                Path.topLeftSweep, Path.topRightSweep, Path.bottomLeftLoop, Path.bottomRightLoop,
            ].map((path) => {
                return {
                    curves: path,
                    type: PathType.single,
                    isChallenge: false,
                };
            })
        ],]]);

    public static getPathOptions(isChallenge: boolean): TypedBezier[] {
        let index = Math.floor(Math.random() * 3);
        let names = [PathType.alt, PathType.double, PathType.alt];
        return Path.typedBeziers.get(names[index])?.filter((entry) => entry.isChallenge == isChallenge) ?? [];
    }
}
