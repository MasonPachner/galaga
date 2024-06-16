import { Player } from "../objects/player";
import { Persitence, KeyBinding } from "../screens/persistance";
import { GameplayLoop } from "./gameplayloop";

export class Keyboard {
    private static keys = new Map<string, number>();
    private static handlers = new Map<string, (a: number) => void>();

    public static initialize() {
        window.addEventListener('keydown', Keyboard.keyPress);
        window.addEventListener('keyup', Keyboard.keyRelease);
    }

    public static reset() {
        Keyboard.handlers = new Map();
    }

    public static keyPress(e: any) {
        Keyboard.keys.set(e.key, e.timeStamp);
    }

    public static keyRelease(e: any) {
        Keyboard.keys.delete(e.key);
    }

    public static update(elapsedTime?: number) {
        for (let key of Keyboard.keys) {
            const onPress = Keyboard.handlers.get(key[0])
            if(onPress){
                onPress(elapsedTime ?? 0);
            }
        }
    };

    public static register(key: string, handler: (a: number) => void) {
        Keyboard.handlers.set(key, handler);
    };

    public static registerExisting(onPause: () => void){
        Keyboard.register(Persitence.getBinding(KeyBinding.pause), () => {
            onPause();
        });
        Keyboard.register(Persitence.getBinding(KeyBinding.left), () => {
            Player.inputMove(-1);
        });
        Keyboard.register(Persitence.getBinding(KeyBinding.right), () => {
            Player.inputMove(1);
        });
        Keyboard.register(Persitence.getBinding(KeyBinding.shoot), () => {
            Player.inputShoot();
        });
    }
};

