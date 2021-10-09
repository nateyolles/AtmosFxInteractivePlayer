const config = require('./config.json');
const express = require('express');
const app = express();
const port = config.portNumber || 3000;

module.exports = class WebServer {
    constructor(videoPlayer) {
        app.get('/play/:id', (req, res) => {
            const id = req.params.id;
            videoPlayer.playVideo(config.videos[id]);
            res.send(`Playing ${id} - ${config.videos[id].path}`);
        });

        app.get('/stop', (req, res) => {
            videoPlayer.stop();
            res.send('Stopping');
        });

        app.get('/stopvideo', (req, res) => {
            videoPlayer.stopVideo();
            res.send('Stopping current video');
        });

        app.listen(port, () => {
            console.log(`AtmosFxInteractivePlayer listening at http://localhost:${port}`)
        });
    };
};
