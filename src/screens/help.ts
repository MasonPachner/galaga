import { GalagaScreen } from "./galagascreen";
import { Galaga, Persitence } from "./galaga";
import { Keyboard } from "../systems/input-keyboard";

export class HelpScreen extends GalagaScreen {
    public override readonly screenName: string = 'help';
    public static readonly instance = new HelpScreen();
    private toChange: string | null = null;
    public initialize() {
        window.addEventListener('keydown', HelpScreen.instance.updateKey);
        document.getElementById('id-help-back')?.addEventListener(
            'click',
            function () { Galaga.showScreen('main-menu'); });
        document.getElementById('id-left')?.addEventListener(
            'click',
            function () { HelpScreen.instance.toChange = 'left'; GalagaScreen.getElement('id-info').innerHTML = "Select key for left"; });
        document.getElementById('id-right')?.addEventListener(
            'click',
            function () { HelpScreen.instance.toChange = 'right'; GalagaScreen.getElement('id-info').innerHTML = "Select key for right"; });
        document.getElementById('id-shoot')?.addEventListener(
            'click',
            function () { HelpScreen.instance.toChange = 'shoot'; GalagaScreen.getElement('id-info').innerHTML = "Select key for shoot"; });
        document.getElementById('id-pause')?.addEventListener(
            'click',
            function () { HelpScreen.instance.toChange = 'pause'; GalagaScreen.getElement('id-info').innerHTML = "Select key for pause"; });
        GalagaScreen.getElement('id-shoot').innerHTML = `Shoot: ${Persitence.getBinding('shoot') == ' ' ? 'Space' : Persitence.getBinding('shoot')}`;
        GalagaScreen.getElement('id-left').innerHTML = `Left: ${Persitence.getBinding('left')}`;
        GalagaScreen.getElement('id-right').innerHTML = `Right: ${Persitence.getBinding('right')}`;
        GalagaScreen.getElement('id-pause').innerHTML = `Pause: ${Persitence.getBinding('pause')}`;
    }

    public run() {
        Keyboard.register('Escape', () => { Galaga.showScreen('main-menu'); });
    }
    public updateKey(e: any) {
        if (this.toChange == null) return;
        Persitence.addKeyBindings(this.toChange, e.key);
        //Too lazy to check. Update all :D
        GalagaScreen.getElement('id-shoot').innerHTML = `Shoot: ${Persitence.getBinding('shoot') == ' ' ? 'Space' : Persitence.getBinding('shoot')}`;
        GalagaScreen.getElement('id-left').innerHTML = `Left: ${Persitence.getBinding('left')}`;
        GalagaScreen.getElement('id-right').innerHTML = `Right: ${Persitence.getBinding('right')}`;
        GalagaScreen.getElement('id-pause').innerHTML = `Pause: ${Persitence.getBinding('pause')}`;
        GalagaScreen.getElement('id-info').innerHTML = "";
        this.toChange = null;
    }
};
