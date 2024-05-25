import { GalagaScreen } from "./galagascreen";
import { Galaga, Persitence } from "./galaga";
import { Keyboard } from "../systems/input-keyboard";

export class HelpScreen extends GalagaScreen {
    public static readonly instance = new HelpScreen();
    private toChange: string | null = null;
    public initialize() {
        window.addEventListener('keydown', HelpScreen.instance.updateKey);
        document.getElementById('id-help-back')?.addEventListener(
            'click',
            function () { Galaga.showScreen('main-menu'); });
        document.getElementById('id-left')?.addEventListener(
            'click',
            function () { HelpScreen.instance.toChange = 'left'; document.getElementById('id-info').innerHTML = "Select key for left"; });
        document.getElementById('id-right')?.addEventListener(
            'click',
            function () { HelpScreen.instance.toChange = 'right'; document.getElementById('id-info').innerHTML = "Select key for right"; });
        document.getElementById('id-shoot')?.addEventListener(
            'click',
            function () { HelpScreen.instance.toChange = 'shoot'; document.getElementById('id-info').innerHTML = "Select key for shoot"; });
        document.getElementById('id-pause')?.addEventListener(
            'click',
            function () { HelpScreen.instance.toChange = 'pause'; document.getElementById('id-info').innerHTML = "Select key for pause"; });
        document.getElementById('id-shoot').innerHTML = `Shoot: ${Persitence.getBinding('shoot') == ' ' ? 'Space' : Persitence.getBinding('shoot')}`;
        document.getElementById('id-left').innerHTML = `Left: ${Persitence.getBinding('left')}`;
        document.getElementById('id-right').innerHTML = `Right: ${Persitence.getBinding('right')}`;
        document.getElementById('id-pause').innerHTML = `Pause: ${Persitence.getBinding('pause')}`;
    }

    public run() {
        Keyboard.register('Escape', () => { Galaga.showScreen('main-menu'); });
    }
    public updateKey(e) {
        if (this.toChange == null) return;
        Persitence.addKeyBindings(this.toChange, e.key);
        //Too lazy to check. Update all :D
        document.getElementById('id-shoot').innerHTML = `Shoot: ${Persitence.getBinding('shoot') == ' ' ? 'Space' : Persitence.getBinding('shoot')}`;
        document.getElementById('id-left').innerHTML = `Left: ${Persitence.getBinding('left')}`;
        document.getElementById('id-right').innerHTML = `Right: ${Persitence.getBinding('right')}`;
        document.getElementById('id-pause').innerHTML = `Pause: ${Persitence.getBinding('pause')}`;
        document.getElementById('id-info').innerHTML = "";
        this.toChange = null;
    }
};
