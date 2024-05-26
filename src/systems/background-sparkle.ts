import { Renderer } from "./renderer";

export class Sparkle {
    private static sparkles: any = [];

    public static initialize() {
        for (let i = 0; i < 200; i++) {
            Sparkle.newSparkle(true);
        }
    }

    private static readonly scales = [[5, 7], [2.5, 4]]; // This should draw a star with 4 pokes per number in this at radius*number
    public static newSparkle(init?: any) {
        Sparkle.sparkles.push({
            x: Math.random(),
            y: init ? Math.random() : 0,
            opacity: Math.random(),
            opacityChange: (1500 + Math.random() * 2000),
            sparkleUp: true,
            sparkleSpin: Math.random() > 0.5 ? -1 : 1,
            red: Math.floor(Math.random() * 110) + 120,
            green: Math.floor(Math.random() * 80) + 150,
            blue: Math.floor(Math.random() * 110) + 120,
            size: Math.random() * 0.002 + 0.0005,
            initialAngle: Math.random() * Math.PI * 4,
            scales: Sparkle.scales[Math.floor(Math.random() * Sparkle.scales.length)]
        });
    }
    public static render() {
        for (let sparkleI in Sparkle.sparkles) {
            let sparkle = Sparkle.sparkles[sparkleI];
            Sparkle.drawSparkle(sparkle);
            Renderer.fillCircle(sparkle.x, sparkle.y, sparkle.size,
                `rgba(${sparkle.red},${sparkle.green},${sparkle.blue},1)`);
        }
    }
    public static drawSparkle(sparkle: any) {
        let lines: any = [];
        let initialAngle = sparkle.initialAngle;
        let prevX = Math.cos(initialAngle) * sparkle.scales[sparkle.scales.length - 1] * sparkle.opacity * sparkle.size + sparkle.x;
        let prevY = Math.sin(initialAngle) * sparkle.scales[sparkle.scales.length - 1] * sparkle.opacity * sparkle.size + sparkle.y;
        let count = 8 * (sparkle.scales.length);
        for (let i = 0; i < count; i++) {
            let scale = i % 2 == 0 ? (sparkle.opacity) : sparkle.scales[(Math.floor(i / sparkle.scales.length) % sparkle.scales.length)] * sparkle.opacity;
            initialAngle += Math.PI / (count / 2);
            let nextX = Math.cos(initialAngle) * scale * sparkle.size + sparkle.x;
            let nextY = Math.sin(initialAngle) * scale * sparkle.size + sparkle.y;
            lines.push({
                p1: {
                    x: prevX,
                    y: prevY
                },
                p2: {
                    x: nextX,
                    y: nextY
                }
            });
            prevX = nextX;
            prevY = nextY;
        }
        Renderer.fillPath(lines, `rgba(${sparkle.red + 20},${sparkle.green + 20},${sparkle.blue + 20},${sparkle.opacity - 0.5})`);
    }

    public static update(elapsedTime: number) {
        let cleanSparkles: any = [];
        for (let sparkleI in Sparkle.sparkles) {
            let sparkle = Sparkle.sparkles[sparkleI];
            sparkle.y += sparkle.size * sparkle.size * elapsedTime * 3;
            sparkle.initialAngle += elapsedTime / (sparkle.sparkleSpin * 1000);
            let ocapityChange = elapsedTime / sparkle.opacityChange;
            sparkle.opacity = sparkle.sparkleUp ? ocapityChange + sparkle.opacity : sparkle.opacity - ocapityChange;
            if (sparkle.opacity > 1) {
                sparkle.sparkleUp = false;
                sparkle.opacity = 1;
            }
            if (sparkle.opacity < 0) {
                sparkle.sparkleUp = true;
                sparkle.opacity = 0;
            }
            if (sparkle.y < 1) {
                cleanSparkles.push(sparkle);
            }

        };
        Sparkle.sparkles = cleanSparkles;

        if (Math.random() > 0.88) {
            Sparkle.newSparkle();
        }
    }
}
