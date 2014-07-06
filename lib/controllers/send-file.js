var utils = require('../utils');

module.exports = function(req, res) {
    var playbackInfo = {};

    playbackInfo.nowPlaying = req.params[0];
    playbackInfo.startTime = req.query.startTime || '00:00:00'
    playbackInfo.startTimeSeconds = utils.strings.convertTimeToSeconds(playbackInfo.startTime);

    global.playbackInfoEmitter.emit('update', playbackInfo);

    res.render('sender', {
       mediaUrl : 'http://' + utils.network.ipAddress + ':1338/stream/' + playbackInfo.nowPlaying
    });
};
