import { GalagaScreen } from "./galagascreen";
import { Galaga } from "./galaga";

export class MainMenuScreen extends GalagaScreen {
    public static readonly instance = new MainMenuScreen();
    private startAttract = true;
    public initialize() {
        // Setup each of menu events for the screens
        document.getElementById('id-new-game')?.addEventListener(
            'click',
            function () { Galaga.showScreen('game-play', false); MainMenuScreen.instance.startAttract = false; });

        document.getElementById('id-high-scores')?.addEventListener(
            'click',
            function () { Galaga.showScreen('high-scores'); MainMenuScreen.instance.startAttract = false; });

        document.getElementById('id-help')?.addEventListener(
            'click',
            function () { Galaga.showScreen('help'); MainMenuScreen.instance.startAttract = false; });

        document.getElementById('id-about')?.addEventListener(
            'click',
            function () { Galaga.showScreen('about'); MainMenuScreen.instance.startAttract = false; });
    }

    public checkToAttract() {
        if (MainMenuScreen.instance.startAttract) {
            Galaga.showScreen('game-play', true);
        }
    }
    public run() {
        this.startAttract = true;
        setTimeout(this.checkToAttract, 10000);
    }
};
