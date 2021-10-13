const pigpio = require('pigpio');
const config = require('./config.json');
const system = require('./system');
const Button = require('./button');
const Leds = require('./leds');
const VideoPlayer = require('./videoplayer');
const WebServer = require('./webserver');

// Initialize pigpio C library
pigpio.initialize();

const leds = new Leds();
const videoPlayer = new VideoPlayer(leds);
const webServer = new WebServer(videoPlayer);

new Button(config.stopGpio, () => {
    console.log('Stop button pressed');
    videoPlayer.stopVideo();
});

new Button(config.rebootGpio, () => {
    console.log('Reboot button pressed');
    system.reboot();
});

new Button(config.shutdownGpio, () => {
    console.log('Shutdown button pressed');
    system.shutdown();
});

config.videos.forEach((video) => {
    const gpio = video.gpio;
    if (gpio) {
        new Button(gpio, () => {
            console.log(`button ${gpio} pressed callback`);
            videoPlayer.queueVideo(video);
        });
    }
});

const exit = () => {
    leds.turnOffAll();
    videoPlayer.close();
    // Terminate pigpio C library
    pigpio.terminate();
};

// ctl+c
process.on('SIGINT', () => {
    process.exit();
});

process.on('exit', () => {
    console.log('process exit');
    exit();
});
