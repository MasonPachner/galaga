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
import { AboutScreen } from "./about";
import { GalagaScreen } from "./galagascreen";
import { GameplayScreen } from "./gameplay";
import { HelpScreen } from "./help";
import { HighScoreScreen } from "./highscores";
import { MainMenuScreen } from "./mainmenu";

export class Galaga {

    private static screens: GalagaScreen[] = [
        AboutScreen.instance,
        HelpScreen.instance,
        GameplayScreen.instance,
        HighScoreScreen.instance,
        MainMenuScreen.instance,
    ];
    //------------------------------------------------------------------
    //
    // This function is used to change to a new active screen.
    //
    //------------------------------------------------------------------
    public static showScreen(id: string, args?: any) {
        //
        // Remove the active state from all screens.  There should only be one...
        let active = document.getElementsByClassName('active');
        for (let screen = 0; screen < active.length; screen++) {
            active[screen].classList.remove('active');
        }

        Keyboard.reset();
        //
        // Tell the screen to start actively running
        const toRun = Galaga.screens.find((screen) => screen.screenName === id);
        if (toRun === undefined) {
            throw new Error(`Screen with id ${id} not found.`);
        }
        toRun.run();
        //
        // Then, set the new screen to be active
        document.getElementById(id)?.classList.add('active');
    }
    //------------------------------------------------------------------
    //
    // This function performs the one-time game initialization.
    //
    //------------------------------------------------------------------
    public static initialize() {
        Keyboard.initialize();
        Persitence.initialize();
        Sparkle.initialize();
        // Go through each of the screens and tell them to initialize
        for (let screen in Galaga.screens) {
            Galaga.screens[screen].initialize();
        }

        //
        // Make the main-menu screen the active one
        Galaga.showScreen('main-menu');

        const idBody = document.getElementById('id-body');
        if (idBody !== null) {
            idBody.style.backgroundImage = Assets.assets.background;
        }
        Galaga.loopMusic();
    }

    public static loopMusic() {
        Utils.safePlay(Assets.assets.music);
        setTimeout(Galaga.loopMusic, 1000);
    }

};


export class Persitence {
    public static highScores = new Map<string, { name: string, score: number }>();
    public static previousScores = localStorage.getItem('MyGame.galagaHighScores');

    public static keyBindings = new Map<string, string>();
    public static previousKeyBindings = localStorage.getItem('MyGame.keyBindings');

    public static initialize() {
        if (Persitence.previousKeyBindings !== null) {
            Persitence.keyBindings = JSON.parse(Persitence.previousKeyBindings);
        } else {
            Persitence.keyBindings.set("left", 'ArrowLeft');
            Persitence.keyBindings.set("right", 'ArrowRight');
            Persitence.keyBindings.set("shoot", ' ');
            Persitence.keyBindings.set("pause", 'Escape');
        }
        if (Persitence.previousScores !== null) {
            Persitence.highScores = JSON.parse(Persitence.previousScores);
        }
    }

    public static add(key: string, value: { name: string, score: number }) {
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

    public static getBinding(key: string): string | undefined {
        return Persitence.keyBindings.get(key);
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

