export abstract class GalagaScreen {
    public abstract readonly screenName: string;
    public abstract initialize(): void;
    public abstract run(args?: any): void;

    public static getElement(id: string): HTMLElement {
        const element = document.getElementById(id);
        if (!element) {
            throw new Error(`Element with id '${id}' not found.`);
        }
        return element;
    }
}