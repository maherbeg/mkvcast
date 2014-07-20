var utils = require('../utils');

module.exports = function(req, res) {
    var mediaDirectories = global.config['mediaDirectories'];

    mediaDirectories = mediaDirectories.map(function(mediaDir) {
       return {
           displayName : mediaDir,
           filePath : mediaDir,
           isDirectory : true
       };
    });

    res.render('list', {
        channels : Object.keys(config.channels || {}),
        dirContents : mediaDirectories,
        nowPlaying : ''
    });
};
