var fs = require('fs');
var spawn = require('child_process').spawn;

module.exports = function(req, res) {
    var fileToStream = req.params[0];
    var startTime = req.query.startTime || '00:00:00';
    var fsStats = fs.statSync(fileToStream);

    res.setHeader('Content-Type', 'video/x-matroska');
    res.setHeader('Content-Disposition','inline; filename=' + fileToStream + ';');
    res.setHeader('Content-Transfer-Encoding', 'binary');
    res.setHeader('Content-Length', fsStats.size);

    var videoEncodingType = /(mkv|mp4|m4v)$/.test(fileToStream) ? 'copy' : 'libx264';

    // TODO pipe playback time
    var ffmpeg = spawn('ffmpeg',
        ['-ss', startTime,
        '-i', fileToStream,
        '-c:v', videoEncodingType,
        '-c:a', 'aac',
        '-ac', '2',
        '-ab', '192k',
        '-strict', '-2', // Needed for ussing aac over libfaac for other platforms
        '-sn', // Avoid the subtitles track
        '-f', 'matroska',
        '-']);

    var closeFfmpeg = function() {
        ffmpeg.stdout.unpipe(res);
        ffmpeg.stderr.unpipe(process.stdout);

        // SIGINT is apparently not being respected...
        ffmpeg.kill('SIGKILL');
    };

    res.on('close', closeFfmpeg);
    res.on('end', closeFfmpeg);

    ffmpeg.stdout.pipe(res);
    ffmpeg.stderr.pipe(process.stdout);
};
