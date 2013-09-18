var express = require('express');
var fs = require('fs');
var http = require('http');
var path = require('path');
var os = require('os');
var spawn = require('child_process').spawn;

var appId = process.argv[2];
var fileToStream = process.argv[3];

var ipAddress;

// There's a better way to do this
var ifaces = os.networkInterfaces();
for (var device in ifaces) {
    ifaces[device].forEach(function(vals) {
       if (vals.family === 'IPv4' && !vals.internal) {
           ipAddress = vals.address;
           return;
       }
    });
    
    if (ipAddress) { break; }
}

console.log(ipAddress);

var app = express();

app.use(express.static(path.resolve(__dirname + '/../static')));

app.set('views', path.resolve(__dirname + '/../static'));
app.set('view engine', 'jade');

app.get('/sender', function(req, res) {
   res.render('sender', {
       mediaUrl : 'http://' + ipAddress + ':1338/',
       appId : appId
   });
});

app.get('/', function(req, res) {
    console.log('serving request');
    console.log(req.headers);
    
    var fsStats = fs.statSync(fileToStream);
    
    res.setHeader('Content-Type', 'video/x-matroska');
    res.setHeader('Content-Disposition','inline; filename=' + fileToStream + ';');
    res.setHeader('Content-Transfer-Encoding', 'binary');
    res.setHeader('Content-Length', fsStats.size)
    
    var ffmpeg = spawn('ffmpeg', 
        ['-i', fileToStream, '-c:v', 'copy', '-c:a', 'libfaac', '-ac', '2', '-ab', '192k', '-f', 'matroska', '-']);
        
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
        
});

app.listen(1338);

console.log('listening');