import { Galaga } from "../screens/galaga";
import { Utils } from "./utils";

export class Assets {
    public static assets: any = {};
    private static readonly assetOrder = [{
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: 'stage1',
        source: '/assets/images/stages/Galaga_stage1.jpg'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: 'stage5',
        source: '/assets/images/stages/Galaga_stage5.jpg'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: 'stage10',
        source: '/assets/images/stages/Galaga_stage10.jpg'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: 'stage20',
        source: '/assets/images/stages/Galaga_stage20.jpg'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: 'stage30',
        source: '/assets/images/stages/Galaga_stage30.jpg'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: 'stage50',
        source: '/assets/images/stages/Galaga_stage50.jpg'
    }, {
        key: 'enemyPro',
        source: '/assets/images/enemyProjectile.png'
    }, {
        key: 'playerPro',
        source: '/assets/images/playerProjectile.png'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: 'enterprise',
        source: '/assets/images/sprites/107px-Galaga_Enterprise.png'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: 'dragonfly',
        source: '/assets/images/sprites/120px-Galaga_Dragonfly.png'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: 'satellite',
        source: '/assets/images/sprites/120px-Galaga_Satellite.png'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: 'bee',
        source: '/assets/images/sprites/Galaga_Bee.png'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: 'bosconian',
        source: '/assets/images/sprites/Galaga_Bosconian.png'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: 'butterfly',
        source: '/assets/images/sprites/Galaga_Butterfly.png'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: 'capture',
        source: '/assets/images/sprites/Galaga_Capture.png'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: 'fighter',
        source: '/assets/images/sprites/Galaga_Fighter.png'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: 'boss1',
        source: '/assets/images/sprites/Galaga_Flagship1.png'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: 'boss2',
        source: '/assets/images/sprites/Galaga_Flagship2.png'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: 'scorpion',
        source: '/assets/images/sprites/Galaga_Scorpion.png'
    }, {
        // https://strategywiki.org/wiki/Galaga/Getting_Started
        key: 'flagship',
        source: '/assets/images/sprites/GLX_Flagship.png'
    }, {
        // Reference: https://freesound.org/people/bubaproducer/sounds/151022/
        key: 'playerLaser',
        source: '/assets/audio/151022__bubaproducer__laser-shot-silenced.mp3'
    }, {
        // Reference: https://freesound.org/people/tommccann/sounds/235968/
        key: 'playerExplosion',
        source: '/assets/audio/235968__tommccann__explosion-01.mp3'
    }, {
        // Reference: https://freesound.org/people/noirenex/sounds/245731/
        key: 'tractorBeam',
        source: '/assets/audio/245731__noirenex__teleport.mp3'
    }, {
        // Reference : "Happy 8bit Loop 01" by Tristan Lohengrin : https://www.tristanlohengrin.com/
        key: 'music',
        source: '/assets/audio/343835__tristan-lohengrin__happy-8bit-loop-01.mp3'
    }, {
        // https://freesound.org/people/wcoltd/sounds/417731/
        key: 'enemyLaser',
        source: '/assets/audio/417731__wcoltd__laser1.mp3'
    }, {
        //  https://freesound.org/people/bareform/sounds/218721/
        key: 'enemyExplosion',
        source: '/assets/audio/218721__bareform__boom-bang.mp3'
    }, {
        key: 'background',
        source: '/assets/images/background.png'
    }];

    // // Reference: https://freesound.org/people/BeatArchive/sounds/417330/
    // MyGame.sounds.levelUp = new Audio('data/audio/417330__beatarchive__thunder-short-intro.mp3');
    // // Reference: https://freesound.org/people/luffy/sounds/17289/
    // MyGame.sounds.asteroidBreak = createAudioBuffer('data/audio/17289__luffy__luffy-earth1.wav',60,1);
    // // Reference: https://freesound.org/people/Willlewis/sounds/244345/
    // MyGame.sounds.thrust = createAudioBuffer('data/audio/244345__willlewis__musket-explosion.wav',200,0.03);

    //------------------------------------------------------------------
    //
    // Helper function used to load assets in the order specified by the
    // 'assets' parameter.  'assets' expects an array of objects with
    // the following format...
    //    {
    //        key: 'asset-1',
    //        source: 'asset/.../asset.png'
    //    }
    //
    // onSuccess is invoked per asset as: onSuccess(key, asset)
    // onError is invoked per asset as: onError(error)
    // onComplete is invoked once per 'assets' array as: onComplete()
    //
    //------------------------------------------------------------------
    public static loadAssets(assets: any, onSuccess: any, onError: any, onComplete: () => void) {
        //
        // When we run out of things to load, that is when we call onComplete.
        if (assets.length > 0) {
            let entry = assets[0];
            Assets.loadAsset(entry.source,
                function (asset: any) {
                    onSuccess(entry, asset);
                    assets.shift(); // Alternatively: assets.splice(0, 1);
                    Assets.loadAssets(assets, onSuccess, onError, onComplete);
                },
                function (error: any) {
                    onError(error);
                    assets.shift(); // Alternatively: assets.splice(0, 1);
                    Assets.loadAssets(assets, onSuccess, onError, onComplete);
                });
        } else {
            onComplete();
        }
    }

    private static loadAsset(source: any, onSuccess: any, onError: any) {
        let xhr = new XMLHttpRequest();
        let fileExtension = source.substr(source.lastIndexOf('.') + 1); // Source: http://stackoverflow.com/questions/680929/how-to-extract-extension-from-filename-string-in-javascript

        if (fileExtension) {
            xhr.open('GET', source, true);
            xhr.responseType = 'blob';

            xhr.onload = function () {
                let asset: any = null;
                if (xhr.status === 200) {
                    if (fileExtension === 'png' || fileExtension === 'jpg') {
                        asset = new Image();
                    } else if (fileExtension === 'mp3' || fileExtension === 'wav') {
                        asset = new Audio();
                    } else {
                        if (onError) {
                            onError('Unknown file extension: ' + fileExtension);
                        }
                    }
                    asset.onload = function () {
                        window.URL.revokeObjectURL(asset.src);
                    };
                    asset.src = window.URL.createObjectURL(xhr.response);
                    if (onSuccess) {
                        onSuccess(asset);
                    }
                } else {
                    if (onError) {
                        onError('Failed to retrieve: ' + source);
                    }
                }
            };
        } else {
            if (onError) {
                onError('Unknown file extension: ' + fileExtension);
            }
        }

        xhr.send();
    }
    //
    // Start with loading the assets, then the scripts.
    public static initialize() {
        Assets.loadAssets(Assets.assetOrder,
            function (source: any, asset: any) { // Store it on success
                Assets.assets[source.key] = asset;
            },
            function (error: any) {
                console.log(error);
            },
            function () {
                Utils.loadAudio();
                Galaga.initialize();
            }
        );
    }
}

Assets.initialize();