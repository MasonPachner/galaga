import { GalagaScreen } from "./galagascreen";
import { Galaga } from "./galaga";
import { Keyboard } from "../systems/input-keyboard";

export class AboutScreen extends GalagaScreen {
    public override readonly screenName: string = 'about';
    public static readonly instance = new AboutScreen();
    public override initialize() {
        document.getElementById('id-about-back')?.addEventListener(
            'click',
            function () { Galaga.showScreen('main-menu'); });
    }

    public override run() {
        Keyboard.register('Escape', () => { Galaga.showScreen('main-menu'); });
    }
};
