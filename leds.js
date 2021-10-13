const ws281x = require('rpi-ws281x');
const config = require('./config.json');

module.exports = class Leds {

    constructor(settings) {
        this.count = settings?.count || config.leds.count;
        ws281x.configure({
            leds: this.count,
            dma: settings?.dma || config.leds.dma,
            brightness: settings?.brightness || config.leds.brightness,
            gpio: settings?.gpio || config.leds.gpio,
            stripType: settings?.stripType || config.leds.stripType,
        });
    };

    turnOn = (red, green, blue, startLed, stopLed) => {
        const pixels = new Uint32Array(this.count);
        const color = this.getColor(red, green, blue);

        for (let i = startLed; i <= stopLed; i++) {
            pixels[i] = color;
        }

        ws281x.render(pixels);
    };

    /**
     * Get the color based on RGB values
     * @param {*} red 0-255
     * @param {*} green 0-255
     * @param {*} blue 0-255
     * @see https://github.com/meg768/rpi-ws281x/blob/master/README.md?plain=1#L86
     * @returns color code for pixels
     */
    getColor = (red = 0, green = 0, blue = 0) => {
        return (red << 16) | (green << 8)| blue;
    };

    turnOffAll = () => {
        this.turnOn(0, 0, 0, 0, this.count - 1);
    };

    reset = () => {
        ws281x.reset();
    };
};