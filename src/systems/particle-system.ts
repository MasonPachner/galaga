import { Random } from "./random";
import { Renderer } from "./renderer";
export interface Arc {  direction: number, range: number}
interface ParticleSpec {
    center: { x: number, y: number };
    size: { mean: number, stdev: number };
    speed: { mean: number, stdev: number };
    lifetime: { mean: number, stdev: number };
    color: string;
    count: number;
}
export class ParticleSystem {
    private static systems: any = [];

    public static newSystem(spec: any, arc: Arc | undefined) {
        let system: any = {
            particles: [],
            spec: spec,
        };
        for (let i = 0; i < spec.count; i++) {
            system.particles.push(ParticleSystem.create(system.spec, arc));
        }
        ParticleSystem.systems.push(system);
    }

    public static create(spec: ParticleSpec, arc: Arc | undefined): any {
        let size = Random.nextGaussian(spec.size.mean, spec.size.stdev);
        let p: any = {
            center: { x: spec.center.x, y: spec.center.y },
            size: { x: Math.max(0, size), y: size },
            direction: arc == undefined ? Random.nextCircleVector() : Random.nextArcVector(arc.range, arc.direction),
            speed: Random.nextGaussian(spec.speed.mean, spec.speed.stdev), // pixels per second
            rotation: 0,
            lifetime: Random.nextGaussian(spec.lifetime.mean, spec.lifetime.stdev), // seconds
            alive: 0,
            color: spec.color,
        };
        return p;
    }

    public static update(elapsedTime: number) {
        elapsedTime = elapsedTime / 1000;
        let keepSys: any = [];
        for (let systemI in ParticleSystem.systems) {
            let nextSet = ParticleSystem.systems[systemI].particles;
            let keep: any = [];
            if (nextSet.length > 0) {
                keepSys.push(ParticleSystem.systems[systemI]);
            }
            for (let p in nextSet) {
                let particle = nextSet[p];
                particle.alive += elapsedTime;
                particle.center.x += (elapsedTime * particle.speed * 0.01 * particle.direction.x);
                particle.center.y += (elapsedTime * particle.speed * 0.01 * particle.direction.y);
                particle.rotation += particle.speed / 500;
                if (particle.alive < particle.lifetime) {
                    keep.push(particle);
                }
            };
            ParticleSystem.systems[systemI].particles = keep;
        }
        ParticleSystem.systems = keepSys;
    }

    public static render() {
        for (let particlesI in ParticleSystem.systems) {
            let system = ParticleSystem.systems[particlesI];
            for (let p in system.particles) {
                let particle = system.particles[p];
                Renderer.fillCircle(particle.center.x, particle.center.y, particle.size.x, particle.color);
            }
        }
    }
    public static ufoExplosion(x: number, y: number, color: string) {
        ParticleSystem.newSystem({
            center: { x: x, y: y },
            size: { mean: 0.0014, stdev: 0.0005 },
            speed: { mean: 10, stdev: 3 },
            lifetime: { mean: 1, stdev: 0.5 },
            color: color,
            count: 200,
        }, undefined);
    }
    public static playerExplosion(x: number, y: number) {
        ParticleSystem.newSystem({
            center: { x: x, y: y },
            size: { mean: 0.0007, stdev: 0.0002 },
            speed: { mean: 10, stdev: 5 },
            lifetime: { mean: 2, stdev: 0.5 },
            color: 'rgba(255,255,255,1)',
            count: 500,
        }, undefined);
        ParticleSystem.newSystem({
            center: { x: x, y: y },
            size: { mean: 0.0012, stdev: 0.00025 },
            speed: { mean: 30, stdev: 1 },
            lifetime: { mean: 2, stdev: 0.5 },
            color: 'rgba(255,0,0,1)',
            count: 600,
        }, undefined);
        ParticleSystem.newSystem({
            center: { x: x, y: y },
            size: { mean: 0.0014, stdev: 0.00025 },
            speed: { mean: 5, stdev: 2 },
            lifetime: { mean: 2, stdev: 0.5 },
            color: 'rgba(255,165,0,1)',
            count: 300,
        }, undefined);
    }
    public static shipThrust(x: number, y: number, arc: Arc) {
        ParticleSystem.newSystem({
            center: { x: x, y: y },
            size: { mean: 0.002, stdev: 0.0025 },
            speed: { mean: 45, stdev: 5 },
            lifetime: { mean: 1, stdev: 0.2 },
            color: 'rgba(120,120,120,1)',
            count: 30,
        }, arc);

    }
    public static projectileThrust(x: number, y: number, arc: any, color: string) {
        ParticleSystem.newSystem({
            center: { x: x, y: y },
            size: { mean: 0.002, stdev: 0.0 },
            speed: { mean: 70, stdev: 10 },
            lifetime: { mean: 0.3, stdev: 0.1 },
            color: color,
            count: 30,
        }, arc);

    }
    public static transformOccuring(x: number, y: number, arc: any) {
        ParticleSystem.newSystem({
            center: { x: x, y: y },
            size: { mean: 0.0002, stdev: 0.0 },
            speed: { mean: 20, stdev: 30 },
            lifetime: { mean: 1, stdev: 0.3 },
            color: 'rgba(60,255,60,1)',
            count: 10,
        }, arc);

    }
    public static tractorBeam(x: number, y: number, arc: Arc, color: string) {
        ParticleSystem.newSystem({
            center: { x: x, y: y },
            size: { mean: .0007, stdev: 0.0 },
            speed: { mean: 80, stdev: 0 },
            lifetime: { mean: 5, stdev: 0 },
            color: color,
            count: 120,
        }, arc);
    }
    public static lifeGained(x: number, y: number) {
        ParticleSystem.newSystem({
            center: { x: x, y: y },
            size: { mean: .0008, stdev: 0.0 },
            speed: { mean: 20, stdev: 1 },
            lifetime: { mean: 2, stdev: 0.2 },
            color: 'rgba(0,150,0,1)',
            count: 200,
        }, undefined);
        ParticleSystem.newSystem({
            center: { x: x, y: y },
            size: { mean: .0008, stdev: 0.0 },
            speed: { mean: 20, stdev: 1 },
            lifetime: { mean: 2, stdev: 0.2 },
            color: 'rgba(150,150,0,1)',
            count: 200,
        }, undefined);
    }
    public static reset() {
        ParticleSystem.systems.length = 0;
    }
};
