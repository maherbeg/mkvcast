var express = require('express');
var fs = require('fs');
var http = require('http');
var path = require('path');
var os = require('os');
var spawn = require('child_process').spawn;

if (!process.argv[2] || !fs.existsSync(process.argv[2])) {
    console.log('Configuration file missing or not specified as an argument!')
    process.exit(1);
}

var config = require(process.argv[2]);

if (!config['applicationId'] || !config['mediaDirectories']) {
    console.log('applicationId or mediaDirectories not specified.');
}

var appId = config['applicationId'];
var fileToStream = process.argv[3];

var streamableFileExtensions = ['mkv', 'avi', 'mp4'];

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

app.get('/send*', function(req, res) {
    var fileToStream = req.params[0];
   res.render('sender', {
       mediaUrl : 'http://' + ipAddress + ':1338/stream/' + fileToStream,
       appId : appId
   });
});

app.get('/stream*', function(req, res) {
    var fileToStream = req.params[0];
    
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

var listRootMediaDirectories = function(req, res) {
    var mediaDirectories = config['mediaDirectories'];
    
    mediaDirectories = mediaDirectories.map(function(mediaDir) {
       return {
           displayName : mediaDir,
           filePath : mediaDir,
           isDirectory : true
       };
    });
    
    res.render('list', {
        dirContents : mediaDirectories
    });
};

var listFiles = function(req, res) {
    var filePath = req.params[0];
    
    if (!filePath) {
        return listRootMediaDirectories(req, res);
    }
    
    var dirContents = fs.readdirSync(filePath);
    
    dirContents = dirContents.filter(function(file) {
        
        if (fs.statSync(path.join(filePath, file)).isDirectory()) {
            return true;
        }

        return streamableFileExtensions.some(function(fileExt) {
           return file.search(fileExt + '$') !== -1;
        });
    });
    
    dirContents = dirContents.map(function(file) {
        var fileStats = fs.statSync(path.join(filePath, file));
        
        return {
            displayName : file,
            filePath : path.join(filePath, file),
            isDirectory : fileStats.isDirectory()
        };
    });

    res.render('list', {
       dirContents : dirContents 
    });
};

app.get('/list', listRootMediaDirectories);
app.get('/list/*', listFiles);

app.listen(1338);

console.log('listening');