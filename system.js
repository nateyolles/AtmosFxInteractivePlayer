const child_process = require('child_process');

module.exports =  {
    reboot: () => {
        console.log('System Reboot');
        child_process.exec('sudo reboot -h now', (msg) => {
            console.log(msg);
        });
    },

    shutdown: () => {
        console.log('System Shutdown');
        child_process.exec('sudo shutdown -h now', (msg) => {
            console.log(msg);
        });
    }
};
