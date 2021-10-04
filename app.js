const express = require('express')
const Player = require('omxconductor')
const weighted = require('weighted')
const config = require('./config.json')
const app = express()
const port = 3000

const backgroundPlayer = new Player(config.bufferVideoPath, {
  audioOutput: config.audioOutput,
  loop: true,
  layer: 0
});

const weightConfig = config.randomVideoPaths.filter(configObj => !configObj.skip).map(configObj => {
  return {[configObj.path]: configObj.weight};
});

let foregroundPlayer = null;
let timer = null;

const getRandomVideo = () => {
  const randomResult = weighted.select(weightConfig);
  console.log(`Randome Result: ${randomResult}`);
  return Object.keys(randomResult)[0];
}

const playRandomVideo = () => {
  timer = setTimeout(() => { playVideo(getRandomVideo()); }, config.randomInterval);
}

const playVideo = (path) => {
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
    });
  }
}

app.get('/play/:id', (req, res) => {
  const id = req.params.id;
  playVideo(config.interactiveVideoPaths[id]);
  res.send(`Playing ${id}`);
})

app.get('/stop', (req, res) => {
  foregroundPlayer?.stop();
  foregroundPlayer = null;
  res.send('Stopping foregroundPlayer');
})

app.get('/start', (req, res) => {
  backgroundPlayer.open();
  playRandomVideo();
  res.send('starting');

})

app.listen(port, () => {
  console.log(`AtmosFxInteractivePlayer listening at http://localhost:${port}`)
})
