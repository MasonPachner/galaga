export abstract class GalagaScreen {
    public static getElement(id: string): HTMLElement {
        const element = document.getElementById(id);
        if (!element) {
            throw new Error(`Element with id '${id}' not found.`);
        }
        return element;
    }
}