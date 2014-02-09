var fs = require('fs');
var spawn = require('child_process').spawn;

module.exports = function(req, res) {
    var fileToStream = req.params[0];
    var fsStats = fs.statSync(fileToStream);
    
    res.setHeader('Content-Type', 'video/x-matroska');
    res.setHeader('Content-Disposition','inline; filename=' + fileToStream + ';');
    res.setHeader('Content-Transfer-Encoding', 'binary');
    res.setHeader('Content-Length', fsStats.size);
    
    var videoEncodingType = /(mkv|mp4)$/.test(fileToStream) ? 'copy' : 'libx264';

    // TODO pipe playback time
    var ffmpeg = spawn('ffmpeg', 
        ['-ss', '00:00:00', '-i', fileToStream, '-c:v', videoEncodingType, '-c:a', 'libfaac', '-ac', '2', '-ab', '192k', '-f', 'matroska', '-']);
        
    var closeFfmpeg = function() {
        ffmpeg.stdout.unpipe(res);
        ffmpeg.stderr.unpipe(process.stdout);

        // SIGINT is apparently not being respected...
        ffmpeg.kill('SIGKILL');
    };

    res.on('close', closeFfmpeg);
    res.on('end', closeFfmpeg);

    ffmpeg.on('exit', closeFfmpeg);

    ffmpeg.stdout.pipe(res);
    ffmpeg.stderr.pipe(process.stdout);
};