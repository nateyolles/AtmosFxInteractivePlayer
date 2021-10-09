# AtmosFX Interactive Player
This player is meant to provide interaction with AtmosFX media. The media requires a buffer file as well as the content files. A good example are the Pumpkin Jamboree packages. The player is meant to run on a Raspberry Pi connected to a projector or screen. The interaction comes from either an HTTP API or physical buttons connected to the Raspberry Pi's GPIOs headers.

## Notes
* This application only runs on the Raspberry Pi. It's only been tested on the Raspberry Pi 4.
* The [pigpio C library](https://github.com/joan2937/pigpio) is required to run with root permissions, thus this application is required to run with root permissions.

## Installation

### Install pigpio C library

```
sudo apt-get update
sudo apt-get install pigpio
```

See [https://github.com/fivdi/pigpio#installation](https://github.com/fivdi/pigpio#installation)

### Increase GPU Memory

Increase your GPU memory through the `raspi-config` utility.

See: [https://github.com/RandomStudio/omxconductor#readme](https://github.com/RandomStudio/omxconductor#readme)

### Install OMXPlayer

```
sudo apt-get install omxplayer
```

See [https://github.com/popcornmix/omxplayer#readme](https://github.com/popcornmix/omxplayer#readme)

### Install NPM Dependencies

```
npm install
```

## Run

With root permissions, run:

```
node app.js
```
