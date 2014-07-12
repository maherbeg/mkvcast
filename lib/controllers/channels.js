var fs = require('fs');
var utils = require('../utils');

var randomIndexForArray = function(array) {
    return Math.floor(Math.random() * array.length);
};

module.exports = function(req, res) {
    var channelName = req.params.channelName;

    if (!config.channels[channelName]) {
        return res.redirect('/list');
    }

    var channelDirs = config.channels[channelName].directories;

    if (!channelDirs || !channelDirs.length) {
        return res.redirect('/list');
    }

    var randomDirIndex = randomIndexForArray(channelDirs);
    var randomDir = channelDirs[randomDirIndex];

    var files = fs
        .readdirSync(randomDir)
        .filter(utils.directory.filterDirectoryContents(randomDir));

    var randomFileIndex = randomIndexForArray(files)

    res.redirect(['/stream', randomDir, files[randomFileIndex]].join('/'));
};
