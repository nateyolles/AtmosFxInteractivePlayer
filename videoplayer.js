const Player = require('omxconductor');
const weighted = require('weighted');
const config = require('./config.json');

module.exports = class VideoPlayer {
    constructor(leds) {
        console.log('init player');

        this.leds = leds;
        this.foregroundPlayer = null;
        this.timer = null;
        this.waitTimer = null;
        this.waitIndex = 0;
        this.randomPathHistory = [];

        this.weightConfig = config.videos.filter(video => !video.random?.skip).map(video => {
            return {[video.path]: video.random.weight};
        });

        this.ledSections = config.videos.filter(video => video.leds?.start && video.leds?.end);

        this.backgroundPlayer = new Player(config.bufferVideoPath, {
            audioOutput: config.audioOutput,
            loop: true,
            layer: 0
        });

        this.backgroundPlayer.open().then((result) => {
            console.log('Background player open');
        }).catch((err) => {
            console.error('Error on open background player', err)
        });

        this.backgroundPlayer.on('error', (err) => {
            console.error('Error on backgroundPlayer', err);
        });

        this.wait();
        this.playRandomVideo();
    };

    playRandomVideo = () => {
        this.timer = setTimeout(() => {
            this.playVideo(this.getRandomVideo());
        }, config.randomInterval);
    };

    getRandomVideo = () => {
        let randomResult;
        let path;

        do {
            randomResult = weighted.select(this.weightConfig);
            path = Object.keys(randomResult)[0];
            console.log('Preliminary random path', path);
            console.log ('History', this.randomPathHistory);
        } while (this.randomPathHistory.includes(path));

        console.log('Random path', path);

        if (this.randomPathHistory.length === config.randomHistory) {
            this.randomPathHistory.shift();
        }
        this.randomPathHistory.push(path);

        console.log('Random History with new path', this.randomPathHistory);

        return config.videos.find(element => {
            return element.path === path;
        });
    };

    playVideo = (video) => {
        const path = video.path;

        if (!this.foregroundPlayer) {
            console.log(`New foregroundPlayer: ${path}`);

            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = null;
            }

            this.stopWait();

            this.foregroundPlayer = new Player(path, {
                audioOutput: config.audioOutput,
                loop: false,
                layer: 2,
            });

            this.foregroundPlayer.open().then((result) => {
                console.log('BackgroundPlayer pause');
                this.backgroundPlayer.pause();
                if (video.leds?.start && video.leds?.end) {
                    this.leds.turnOn(0, 255, 0, video.leds.start, video.leds.end);
                }
            }).catch((err) => {
                console.error('Error on open foreground player:', err);
            });

            this.foregroundPlayer.on('progress', (progress) => {
                if (progress.progress >= .95) {
                    console.log('BackgroundPlayer resume', progress.progress);
                    this.backgroundPlayer.resume();
                }
            });

            this.foregroundPlayer.on('close', () => {
                console.log('ForegroundPlayer close');
                this.foregroundPlayer = null;
                this.playRandomVideo();
                this.leds.turnOffAll();
                this.wait();
            });

            this.foregroundPlayer.on('error', (err) => {
                console.error('Error on foreground', err);
            });
        }
    };

    stopVideo = () => {
        console.log('Stop video');
        this.backgroundPlayer.resume();
        this.foregroundPlayer?.stop();
        //foregroundPlayer nulls in the close event listener
    };

    close = () => {
        this.backgroundPlayer?.stop();
        this.backgroundPlayer = null;
        this.foregroundPlayer?.stop();
        this.foregroundPlayer = null;
        this.stopWait();
    };

    wait = () => {
        console.log('start wait');
        this.waitTimer = setInterval(() => {
            const ledSection = this.ledSections[this.waitIndex].leds;
            this.leds.turnOffAll();
            this.leds.turnOn(255,255,255, ledSection.start, ledSection.end);
            this.waitIndex = this.waitIndex >= this.ledSections.length - 1 ? 0 : this.waitIndex + 1;
        }, config.leds.waitInterval);
    };

    stopWait = () => {
        if (this.waitTimer) {
            clearInterval(this.waitTimer);
            this.waitTimer = null;
            this.leds.turnOffAll();
        }
    };
};
