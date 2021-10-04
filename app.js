const express = require('express')
const Player = require('omxconductor')
const weighted = require('weighted')
const config = require('./config.json')
const app = express()
const port = 3000

const player = new Player(config.bufferVideoPath, {
  audioOutput: config.audioOutput,
  loop: true,
  layer: 0
});

let player2 = null;

app.get('/play/:id', (req, res) => {
  const id = req.params.id;

  if (!player2) {
    console.log('new player2');
    player2 = new Player(config.interactiveVideoPaths[id], {
      audioOutput: config.audioOutput,
      loop: false,
      layer: 2,
    });
    player2.open().then((result) => {
      console.log('player pause');	
      player.pause();
    });
    player2.on('progress', (progress) => {
      if (progress.progress >= .95) {
	console.log('player resume', progress.progress);
        player.resume();
      }
    });
    player2.on('close', () => {
      console.log('player 2 close');
      player2 = null;
    });
  }
  res.send(`Playing: ${id}`);
})

app.get('/test/:scene/:id', (req, res) => {
  const scene = req.params.scene;
  const id = req.params.id;
  res.send(`Scene: ${scene}, ID: ${id}`);
})

app.get('/stop', (req, res) => {
  player2?.stop();
  player2 = null;
  res.send('stopping');
})

app.get('/start', (req, res) => {
  player.open();
  res.send('starting');
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

