import { Renderer } from "./renderer";

// Renders text to screen for a given duration. Used for challenge information and intro.
export class ScreenText {
    private static currentItems: any = [];

    public static update(elapsedTime: number) {
        let copy: any = [];
        for (let textI in ScreenText.currentItems) {
            let text = ScreenText.currentItems[textI];
            text.currentTime += elapsedTime;
            if (text.currentTime < text.duration) {
                copy.push(text);
            }
        }
        ScreenText.currentItems = copy;
    }

    public static render() {
        for (let textI in ScreenText.currentItems) {
            let text = ScreenText.currentItems[textI];
            Renderer.strongText(text.text, text.location.x, text.location.y, text.size, text.color);
        }
    }

    public static addText(text: string, x: number, y: number, size: number, duration: number, color: string) {
        ScreenText.currentItems.push({
            text: text,
            location: {
                x: x,
                y: y,
            },
            size: size,
            duration: duration,
            currentTime: 0,
            color: color,
        });
    }
};