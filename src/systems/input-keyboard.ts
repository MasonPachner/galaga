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

    public static keyPress(e) {
        Keyboard.keys[e.key] = e.timeStamp;
    }

    public static keyRelease(e) {
        Keyboard.keys.delete(e.key);
    }

    public static update(elapsedTime?: number) {
        for (let key in Keyboard.keys) {
            if (Keyboard.keys.hasOwnProperty(key)) {
                if (Keyboard.handlers.get(key)) {
                    Keyboard.handlers.get(key)?.(elapsedTime ?? 0);
                }
            }
        }
    };

    public static register(key: string, handler: (a: number) => void) {
        Keyboard.handlers.set(key, handler);
    };
};

