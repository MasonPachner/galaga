import { Assets } from "./assets";
import { Utils } from "./utils";

Utils.canvas.width = window.innerWidth;
Utils.canvas.height = window.innerHeight;
export class Renderer {
    private static context = Utils.canvas.getContext('2d');
    public static scaleS() {
        return Math.max(Utils.canvas.width, Utils.canvas.height);
    }
    public static scaleL() {
        return Math.max(Utils.canvas.width, Utils.canvas.height);
    }
    public static fillCircle(x: number, y: number, radius: number, color: string): void {
        Renderer.context.beginPath();
        Renderer.context.fillStyle = color;
        Renderer.context.arc(x * Utils.canvas.width, y * Utils.canvas.height, radius * Renderer.scaleS(), 0, 2 * Math.PI, false);
        Renderer.context.fill();
    }

    public static clear() {
        Renderer.context.clearRect(0, 0, Utils.canvas.width, Utils.canvas.height);
        Utils.canvas.width = window.innerWidth;
        Utils.canvas.height = window.innerHeight;
    }

    public static strokeArc(color: string, x: number, y: number, arcSize: number, strokeWidth: number, radius: number, direction: number): void {
        Renderer.context.beginPath();
        Renderer.context.strokeStyle = color;
        Renderer.context.lineWidth = Math.max(Math.floor(strokeWidth * Renderer.scaleL()), 1);
        Renderer.context.arc(x * Utils.canvas.width, y * Utils.canvas.height, radius * Renderer.scaleL(), direction - arcSize / 2, direction + arcSize / 2);
        Renderer.context.stroke();
    }
    public static fillPath(lines: any[], color: string) {
        Renderer.context.save();
        Renderer.context.beginPath();
        //context.strokeStyle = 'rgba(0,0,0,1)';
        Renderer.context.moveTo(lines[0].p1.x * Utils.canvas.width, lines[0].p1.y * Utils.canvas.height);
        for (let surfaceDataI in lines) {
            let surfaceData = lines[surfaceDataI];
            Renderer.context.lineTo(surfaceData.p2.x * Utils.canvas.width, surfaceData.p2.y * Utils.canvas.height);
        }
        Renderer.context.closePath();
        Renderer.context.clip();
        //context.drawImage(moonIm, leftMostXCoor, highestYCoor, Utils.canvas.width, highestYCoor);
        //context.stroke();
        Renderer.context.fillStyle = color;
        Renderer.context.fill();
        Renderer.context.restore();
    }

    public static drawImage(image: any, x: number, y: number, width: number, height: number, rotation: number): void {
        Renderer.context.save();
        Renderer.context.translate(x * Utils.canvas.width, y * Utils.canvas.height);
        Renderer.context.rotate(rotation);
        Renderer.context.translate(-x * Utils.canvas.width, -y * Utils.canvas.height);
        Renderer.context.drawImage(
            image,
            (x - width) * Utils.canvas.width,
            (y - height) * Utils.canvas.height,
            (width * 2) * Utils.canvas.width,
            (height * 2) * Utils.canvas.height);
        Renderer.context.restore();
    }
    public static drawImageRaw(image: any, x: number, y: number, width: number, height: number): void {
        Renderer.context.drawImage(image, x * Utils.canvas.width, y * Utils.canvas.height, width * Utils.canvas.width, height * Utils.canvas.height);
    }

    public static levelTags = [1, 5, 10, 20, 30, 50];
    public static stage1 = Assets.assets.stage1;
    public static stage5 = Assets.assets.stage5;
    public static stage10 = Assets.assets.stage10;
    public static stage20 = Assets.assets.stage20;
    public static stage30 = Assets.assets.stage30;
    public static stage50 = Assets.assets.stage50;
    public static levelImages = [Renderer.stage1, Renderer.stage5, Renderer.stage10, Renderer.stage20, Renderer.stage30, Renderer.stage50];

    public static displayLevel(level: number) {
        let remaininglevel = level;
        let index = Renderer.levelTags.length - 1;
        let displayCount = 0;
        let hieght = 0.02;
        let width = 0.01;
        while (remaininglevel > 0) {
            if (remaininglevel - Renderer.levelTags[index] >= 0) {
                Renderer.drawImageRaw(Renderer.levelImages[index], 1 - (displayCount + 1) * width, 1 - hieght, width, hieght);
                displayCount++;
                remaininglevel -= Renderer.levelTags[index];
            } else {
                index--;
            }
        }
    }

    public static fillRect(x: number, y: number, width: number, height: number, color: any) {
        Renderer.context.fillStyle = color;
        Renderer.context.fillRect(x * Utils.canvas.width, y * Utils.canvas.height, width, height);
    }

    public static strongText(string: string, x: number, y: number, fontsize: string | number, color: string, black: boolean = false) {
        Renderer.context.fillStyle = color;
        Renderer.context.lineWidth = 1;
        Renderer.context.strokeStyle = black ? 'rgba(0,0,0,1)' : 'rgba(255,255,255,1)';
        Renderer.context.font = fontsize + "px Impact";
        Renderer.context.fillText(string, x * Utils.canvas.width, y * Utils.canvas.height);
        Renderer.context.strokeText(string, x * Utils.canvas.width, y * Utils.canvas.height);
    }

    public static drawLine(color: string, p1x: number, p1y: number, p2x: number, p2y: number) {
        Renderer.context.beginPath();
        Renderer.context.lineWidth = 20;
        Renderer.context.strokeStyle = color;
        Renderer.context.moveTo(p1x * Utils.canvas.width, p1y * Utils.canvas.height);
        Renderer.context.lineTo(p2x * Utils.canvas.width, p2y * Utils.canvas.height);
        Renderer.context.stroke();
    }
};