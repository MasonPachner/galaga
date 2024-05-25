// ------------------------------------------------------------------
//
// This is a random number generation object.  It provides a handful
// of different ways to generate random numbers.  It is written as a
// Singleton so that there is only one of these throughout the program.
//
// ------------------------------------------------------------------
export class Random {

    public static nextDouble() {
        return Math.random();
    }

    public static nextRange(min, max) {
        let range = max - min;
        return Math.floor((Math.random() * range) + min);
    }

    public static nextCircleVector() {
        let angle = Math.random() * 2 * Math.PI;
        return {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
    }
    public static nextArcVector(range, direction) {
        let angle = Number((Math.random() * range * 2) - range + direction);

        return {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
    }

    //
    // This is used to give a small performance optimization in generating gaussian random numbers.
    public static usePrevious = false;
    public static y2;

    //
    // Generate a normally distributed random number.
    //
    // NOTE: This code is adapted from a wiki reference I found a long time ago.  I originally
    // wrote the code in C# and am now converting it over to JavaScript.
    //
    public static nextGaussian(mean, stdDev) {
        let x1 = 0;
        let x2 = 0;
        let y1 = 0;
        let z = 0;

        if (Random.usePrevious) {
            Random.usePrevious = false;
            return mean + Random.y2 * stdDev;
        }

        Random.usePrevious = true;

        do {
            x1 = 2 * Math.random() - 1;
            x2 = 2 * Math.random() - 1;
            z = (x1 * x1) + (x2 * x2);
        } while (z >= 1);

        z = Math.sqrt((-2 * Math.log(z)) / z);
        y1 = x1 * z;
        Random.y2 = x2 * z;

        return mean + y1 * stdDev;
    }

};
