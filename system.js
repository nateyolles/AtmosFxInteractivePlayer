module.exports =  {
    reboot: () => {
        console.log('System Reboot');
        shell.exec('sudo reboot -h now');
    },

    shutdown: () => {
        console.log('System Shutdown');
        shell.exec('sudo shutdown -h now');
    }
};
