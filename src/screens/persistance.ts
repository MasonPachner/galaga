// ------------------------------------------------------------------
// 
// This is the game object.  Everything about the game is located in 
// this object.
//
// ------------------------------------------------------------------

import { Assets } from "../systems/assets";
import { Sparkle } from "../systems/background-sparkle";
import { Keyboard } from "../systems/input-keyboard";
import { Utils } from "../systems/utils";


export class Persitence {
    public static highScores = new Map<string, { name: string, score: number }>();
    public static previousScores = localStorage.getItem('MyGame.galagaHighScores');

    public static keyBindings = new Map<string, string>();
    public static previousKeyBindings = localStorage.getItem('MyGame.keyBindings');

    public static initialize() {
        // if (Persitence.previousKeyBindings !== null) {
        //     Persitence.keyBindings = JSON.parse(Persitence.previousKeyBindings);
        // } else {
            Persitence.keyBindings.set("left", 'ArrowLeft');
            Persitence.keyBindings.set("right", 'ArrowRight');
            Persitence.keyBindings.set("shoot", ' ');
            Persitence.keyBindings.set("pause", 'Escape');
        // }
        if (Persitence.previousScores !== null) {
            Persitence.highScores = JSON.parse(Persitence.previousScores);
        }
    }

    public static add(key: string, value: any) {
        Persitence.highScores.set(key, value);
        localStorage['MyGame.galagaHighScores'] = JSON.stringify(Persitence.highScores);
    }

    public static remove(key: string): void {
        Persitence.highScores.delete(key);
        localStorage['MyGame.galagaHighScores'] = JSON.stringify(Persitence.highScores);
    }

    public static addKeyBindings(key: string, value: any) {
        Persitence.keyBindings.set(key, value);
        localStorage['MyGame.keyBindings'] = JSON.stringify(Persitence.keyBindings);
    }

    public static removeKeyBindings(key: string): void {
        Persitence.keyBindings.delete(key);
        localStorage['MyGame.keyBindings'] = JSON.stringify(Persitence.keyBindings);
    }

    public static getBinding(key: string): string {
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

