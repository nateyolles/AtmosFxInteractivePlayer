const config = require('./config.json');
const express = require('express');
const system = require('./system');
const app = express();
const port = config.portNumber || 3000;

module.exports = class WebServer {
    constructor(videoPlayer) {
        app.get('/queue/:id', (req, res) => {
            const id = req.params.id;
            videoPlayer.queueVideo(config.videos[id]);
            res.send(`Queueing ${config.videos[id].path}`);
        });

        app.get('/stop', (req, res) => {
            videoPlayer.stop();
            res.send('Stopping');
        });

        app.get('/stopvideo', (req, res) => {
            videoPlayer.stopVideo();
            res.send('Stopping current video');
        });

        app.get('/reboot', (req, res) => {
            system.reboot();
            res.send('Rebooting');
        });

        app.get('/shutdown', (req, res) => {
            system.shutdown();
            res.send('Shutting down');
        });

        app.listen(port, () => {
            console.log(`AtmosFxInteractivePlayer listening at http://localhost:${port}`)
        });
    };
};
