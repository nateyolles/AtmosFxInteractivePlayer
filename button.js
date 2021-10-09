const Gpio = require('pigpio').Gpio;

module.exports = class Button {
    constructor(gpio, callback) {
        this.gpio = gpio;
        const button = new Gpio(gpio, {
            mode: Gpio.INPUT,
            pullUpDown: Gpio.PUD_UP,
            alert: true
        });

        button.glitchFilter(10000);

        button.on('alert', (level, tick) => {
            // if pressed
            if (level === 0) {
                console.log(`button ${this.gpio} pressed`);
                callback(); // return promise
            }
        });
    };
};
