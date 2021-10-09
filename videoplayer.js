const Player = require('omxconductor');
const weighted = require('weighted');
const config = require('./config.json');

module.exports = class VideoPlayer {
    constructor() {
        console.log('init player');

        this.foregroundPlayer = null;
        this.timer = null;

        this.weightConfig = config.videos.filter(video => !video.random?.skip).map(video => {
            return {[video.path]: video.random.weight};
        });

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

        this.playRandomVideo();
    };

    playRandomVideo = () => {
        this.timer = setTimeout(() => {
            this.playVideo(this.getRandomVideo());
        }, config.randomInterval);
    };

    getRandomVideo = () => {
        const randomResult = weighted.select(this.weightConfig);
        const path = Object.keys(randomResult)[0];
        console.log('Random path', path);
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

            this.foregroundPlayer = new Player(path, {
                audioOutput: config.audioOutput,
                loop: false,
                layer: 2,
            });

            this.foregroundPlayer.open().then((result) => {
                console.log('BackgroundPlayer pause');
                this.backgroundPlayer.pause();
                if (video.leds?.start && video.leds?.end) {
                    //leds.turnOn(0, 255, 0, video.leds.start, video.leds.end);
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
                //leds.turnOffAll();
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
    };
};
