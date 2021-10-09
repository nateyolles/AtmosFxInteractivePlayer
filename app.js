const express = require('express');
const Player = require('omxconductor');
const weighted = require('weighted');
const config = require('./config.json');
const app = express();
const port = 3000;
const pigpio = require('pigpio');
const Button = require('./button');
const Leds = require('./leds');

// Initialize pigpio C library
pigpio.initialize();

let foregroundPlayer = null;
let timer = null;
let backgroundPlayer = null;

const leds = new Leds();

const stopButton = new Button(config.stopGpio, () => {
    console.log('Stop button pressed');
    stopVideo();
});

config.videos.forEach((video) => {
    const gpio = video.gpio;
    if (gpio) {
        new Button(gpio, () => {
            console.log(`button ${gpio} pressed callback`);
            playVideo(video);
        });
    }
});

const weightConfig = config.videos.filter(video => !video.random?.skip).map(video => {
    return {[video.path]: video.random.weight};
});

const getRandomVideo = () => {
    const randomResult = weighted.select(weightConfig);
    const path = Object.keys(randomResult)[0];
    console.log(`random path: ${path}`);
    const video = config.videos.find(element => {
        return element.path === path;
    });

    return video;
};

const playRandomVideo = () => {
    timer = setTimeout(() => {
        playVideo(getRandomVideo());
    }, config.randomInterval);
};

const playVideo = (video) => {
    const path = video.path;

    if (!foregroundPlayer) {
        console.log(`new foregroundPlayer: ${path}`);

        if (timer) {
            clearTimeout(timer);
            timer = null;
        }

        foregroundPlayer = new Player(path, {
            audioOutput: config.audioOutput,
            loop: false,
            layer: 2,
        });

        foregroundPlayer.open().then((result) => {
            console.log('backgroundPlayer pause');
            backgroundPlayer.pause();
            if (video.leds?.start && video.leds?.end) {
                leds.turnOn(0, 255, 0, video.leds.start, video.leds.end);
            }
        }).catch((err) => {
            console.error('error on open foreground player:', err)
        });

        foregroundPlayer.on('progress', (progress) => {
            if (progress.progress >= .95) {
                console.log('backgroundPlayer resume', progress.progress);
                backgroundPlayer.resume();
            }
        });

        foregroundPlayer.on('close', () => {
            console.log('foregroundPlayer close');
            foregroundPlayer = null;
            playRandomVideo();
            leds.turnOffAll();
        });

        foregroundPlayer.on("error", (err) => {
            console.error("foreground **************** error event:", err);
        });
    }
};

const init = () => {
    console.log('init');
    backgroundPlayer = new Player(config.bufferVideoPath, {
        audioOutput: config.audioOutput,
        loop: true,
        layer: 0
    });

    backgroundPlayer.open().then((result) => {
        console.log('background player open');
    }).catch((err) => {
        console.error('error on open background player:', err)
    });

    backgroundPlayer.on("error", (err) => {
        console.error("backgroundPlayer **************** error event:", err);
    });

    playRandomVideo();
};

const stop = () => {
    console.log('stop');
    stopVideo();
    backgroundPlayer?.stop().then((result) => {
        console.log('backroundPlayer player null');
        backgroundPlayer = null;
    });
};

const stopVideo = () => {
    console.log('stop video');
    backgroundPlayer.resume();
    foregroundPlayer?.stop();
    //foregroundPlayer nulls in the close event listener
};

app.get('/play/:id', (req, res) => {
    const id = req.params.id;
    playVideo(config.videos[id]);
    res.send(`Playing ${id}`);
});

app.get('/stop', (req, res) => {
    stop();
    res.send('Stopping');
});

app.get('/stopvideo', (req, res) => {
    stopVideo();
    res.send('Stopping current video');
});

app.get('/init', (req, res) => {
    init();
    res.send('initializing');
});

app.listen(port, () => {
    console.log(`AtmosFxInteractivePlayer listening at http://localhost:${port}`)
});

const exit = () => {
    leds.turnOffAll();
    backgroundPlayer?.stop();
    backgroundPlayer = null;
    foregroundPlayer?.stop();
    foregroundPlayer = null;

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

// start now
init();
