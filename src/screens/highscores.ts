import { Keyboard } from "../systems/input-keyboard";
import { GalagaScreen } from "./galagascreen";
import { Galaga, Persitence } from "./galaga";

export class HighScoreScreen extends GalagaScreen {
    public static readonly instance = new HighScoreScreen();
    public initialize() {
        document.getElementById('id-high-scores-back')?.addEventListener(
            'click',
            function () { Galaga.showScreen('main-menu'); });

        Keyboard.register('Escape', () => { Galaga.showScreen('main-menu'); });
    }
    public run() {
        Keyboard.register('Escape', () => { Galaga.showScreen('main-menu'); });
        Persitence.report();
    }
};
