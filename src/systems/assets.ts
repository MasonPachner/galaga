import { Persitence } from "../screens/persistance";
import { Sparkle } from "./background-sparkle";
import { Keyboard } from "./input-keyboard";
import { Utils } from "./utils";

interface AssetDef {
    source: string;
    key: string;
}

export class Assets {
    public static images = new Map<string, HTMLImageElement>();
    public static audio = new Map<string, AudioBuffer>();
    private static readonly audioContext = new window.AudioContext();

    public static readonly stage1: string = "stage1";
    public static readonly stage5: string = "stage5";
    public static readonly stage10: string = "stage10";
    public static readonly stage20: string = "stage20";
    public static readonly stage30: string = "stage30";
    public static readonly stage50: string = "stage50";
    public static readonly levelImages: string[] = [Assets.stage1, Assets.stage5, Assets.stage10, Assets.stage20, Assets.stage30, Assets.stage50];

    public static readonly enemyPro: string = "enemyPro";
    public static readonly playerPro: string = "playerPro";
    public static readonly enterprise: string = "enterprise";
    public static readonly dragonfly: string = "dragonfly";
    public static readonly satellite: string = "satellite";
    public static readonly bee: string = "bee";
    public static readonly bosconian: string = "bosconian";
    public static readonly butterfly: string = "butterfly";
    public static readonly capture: string = "capture";
    public static readonly fighter: string = "fighter";
    public static readonly boss1: string = "boss1";
    public static readonly boss2: string = "boss2";
    public static readonly scorpion: string = "scorpion";
    public static readonly flagship: string = "flagship";
    public static readonly playerLaser: string = "playerLaser";
    public static readonly playerExplosion: string = "playerExplosion";
    public static readonly tractorBeam: string = "tractorBeam";
    public static readonly music: string = "music";
    public static readonly enemyLaser: string = "enemyLaser";
    public static readonly enemyExplosion: string = "enemyExplosion";
    public static readonly background: string = "background";

    private static readonly assetOrder: AssetDef[] = [{
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: Assets.stage1,
        source: '/images/stages/Galaga_stage1.jpg'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: Assets.stage5,
        source: '/images/stages/Galaga_stage5.jpg'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: Assets.stage10,
        source: '/images/stages/Galaga_stage10.jpg'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: Assets.stage20,
        source: '/images/stages/Galaga_stage20.jpg'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: Assets.stage30,
        source: '/images/stages/Galaga_stage30.jpg'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: Assets.stage50,
        source: '/images/stages/Galaga_stage50.jpg'
    }, {
        key: Assets.enemyPro,
        source: '/images/enemyProjectile.png'
    }, {
        key: Assets.playerPro,
        source: '/images/playerProjectile.png'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: Assets.enterprise,
        source: '/images/sprites/107px-Galaga_Enterprise.png'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: Assets.dragonfly,
        source: '/images/sprites/120px-Galaga_Dragonfly.png'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: Assets.satellite,
        source: '/images/sprites/120px-Galaga_Satellite.png'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: Assets.bee,
        source: '/images/sprites/Galaga_Bee.png'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: Assets.bosconian,
        source: '/images/sprites/Galaga_Bosconian.png'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: Assets.butterfly,
        source: '/images/sprites/Galaga_Butterfly.png'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: Assets.capture,
        source: '/images/sprites/Galaga_Capture.png'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: Assets.fighter,
        source: '/images/sprites/Galaga_Fighter.png'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: Assets.boss1,
        source: '/images/sprites/Galaga_Flagship1.png'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: Assets.boss2,
        source: '/images/sprites/Galaga_Flagship2.png'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: Assets.scorpion,
        source: '/images/sprites/Galaga_Scorpion.png'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: Assets.flagship,
        source: '/images/sprites/GLX_Flagship.png'
    }, {
        // Reference: https://freesound.org/people/bubaproducer/sounds/151022/
        key: Assets.playerLaser,
        source: '/audio/151022__bubaproducer__laser-shot-silenced.mp3'
    }, {
        // Reference: https://freesound.org/people/tommccann/sounds/235968/
        key: Assets.playerExplosion,
        source: '/audio/235968__tommccann__explosion-01.mp3'
    }, {
        // Reference: https://freesound.org/people/noirenex/sounds/245731/
        key: Assets.tractorBeam,
        source: '/audio/245731__noirenex__teleport.mp3'
    }, {
        // Reference : "Happy 8bit Loop 01" by Tristan Lohengrin : https://www.tristanlohengrin.com/
        key: Assets.music,
        source: '/audio/343835__tristan-lohengrin__happy-8bit-loop-01.mp3'
    }, {
        // https://freesound.org/people/wcoltd/sounds/417731/
        key: Assets.enemyLaser,
        source: '/audio/417731__wcoltd__laser1.mp3'
    }, {
        //  https://freesound.org/people/bareform/sounds/218721/
        key: Assets.enemyExplosion,
        source: '/audio/218721__bareform__boom-bang.mp3'
    }, {
        key: Assets.background,
        source: '/images/background.png'
    }];

    private static async loadImageAsync(key: string, source: string): Promise<void> {
        const image = new Image();
        image.src = source;
        await image.decode();
        Assets.images.set(key, image);
    }

    private static async loadAudioAsync(key: string, source: string): Promise<void> {
        const response = await fetch(source)
        const buffer = await Assets.audioContext.decodeAudioData(await response.arrayBuffer());
        Assets.audio.set(key, buffer);
    }

    //
    // Start with loading the assets, then the scripts.
    public static async initialize() {
        const _ = await Promise.all(Assets.assetOrder.map((asset) => {
            if (asset.source.endsWith('.png') || asset.source.endsWith('.jpg')) {
                return Assets.loadImageAsync(asset.key, asset.source);
            }
            return Assets.loadAudioAsync(asset.key, asset.source);
        }));
        Persitence.initialize();
        Utils.loadAudio();
        Keyboard.initialize();
        Sparkle.initialize();
        // const idBody = document.getElementById('id-body');
        // if (idBody !== null) {
        //     idBody.style.backgroundImage = Assets.images.get('background')?.src ?? '';
        // }
        Assets.loopMusic();
    }


    public static loopMusic() {
        Utils.safePlay(Assets.music!);
        setTimeout(Assets.loopMusic, 1000);
    }
}
