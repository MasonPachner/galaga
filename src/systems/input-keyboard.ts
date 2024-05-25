export class Keyboard {
    private static keys: {};
    private static handlers: {};

    public static initialize() {
        window.addEventListener('keydown', Keyboard.keyPress);
        window.addEventListener('keyup', Keyboard.keyRelease);
    }

    public static reset() {
        Keyboard.handlers = {};
    }

    public static keyPress(e) {
        Keyboard.keys[e.key] = e.timeStamp;
    }

    public static keyRelease(e) {
        delete Keyboard.keys[e.key];
    }

    public static update(elapsedTime?: number) {
        for (let key in Keyboard.keys) {
            if (Keyboard.keys.hasOwnProperty(key)) {
                if (Keyboard.handlers[key]) {
                    Keyboard.handlers[key](elapsedTime);
                }
            }
        }
    };

    public static register(key, handler) {
        Keyboard.handlers[key] = handler;
    };
};

