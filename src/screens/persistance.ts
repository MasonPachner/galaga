export enum KeyBinding {
    left = 'left',
    right = 'right',
    shoot = 'shoot',
    pause = 'pause',
}

export class Persitence {
    public static highScores = new Map<string, { name: string, score: number }>();
    public static previousScores = localStorage.getItem('MyGame.galagaHighScores');

    public static keyBindings = new Map<KeyBinding, string>([
        [KeyBinding.left, 'ArrowLeft'], [KeyBinding.right, 'ArrowRight'], [KeyBinding.shoot, ' '], [KeyBinding.pause, 'Escape']
    ]);
    public static previousKeyBindings = localStorage.getItem('MyGame.keyBindings');

    public static initialize() {
        // if (Persitence.previousKeyBindings !== undefined) {
        //     Persitence.keyBindings = JSON.parse(Persitence.previousKeyBindings);
        // } else {
        // }
        if (Persitence.previousScores !== null) {
            Persitence.highScores = JSON.parse(Persitence.previousScores);
        }
    }

    public static add(key: string, value: any) {
        // Persitence.highScores.set(key, value);
        localStorage['MyGame.galagaHighScores'] = JSON.stringify(Persitence.highScores);
    }

    public static remove(key: string): void {
        Persitence.highScores.delete(key);
        localStorage['MyGame.galagaHighScores'] = JSON.stringify(Persitence.highScores);
    }

    public static addKeyBindings(key: KeyBinding, value: any) {
        Persitence.keyBindings.set(key, value);
        localStorage['MyGame.keyBindings'] = JSON.stringify(Persitence.keyBindings);
    }

    public static removeKeyBindings(key: KeyBinding): void {
        Persitence.keyBindings.delete(key);
        localStorage['MyGame.keyBindings'] = JSON.stringify(Persitence.keyBindings);
    }

    public static getBinding(key: KeyBinding): string {
        const binding = Persitence.keyBindings.get(key);
        if (binding === undefined) {
            throw new Error(`Key binding for ${key} is undefined.`);
        }
        return binding;
    }

    public static report() {
        let htmlNode: any = document.getElementById('scorelist');

        htmlNode.innerHTML = '';
        let sorted: any[] = [];
        for (let key in Persitence.highScores) {
            sorted.push(Persitence.highScores.get(key));
        }
        sorted.sort(function (a, b) { return b.score - a.score; });
        let max = 5;
        for (let key in sorted) {
            if (Number.isNaN(sorted[key].score) || sorted[key].score == undefined)
                continue;
            if (max == 0)
                break;
            htmlNode.innerHTML += ('<li>' + sorted[key].score + '</li>');
            max--;
        }
        htmlNode.scrollTop = htmlNode.scrollHeight;
    }
}

