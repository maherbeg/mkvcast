var _ = require('lodash');
var express = require('express');
var fs = require('fs');
var http = require('http');
var path = require('path');
var os = require('os');
var spawn = require('child_process').spawn;
var WebSocketServer = require('ws').Server;

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

app.use('/components', express.static(path.resolve(__dirname + '/../bower_components')));
app.use('/static', express.static(path.resolve(__dirname + '/../static')));

app.set('views', path.resolve(__dirname + '/../static'));
app.set('view engine', 'jade');

/**
 * @type {Object}
 * playbackInfo.currentTimeSeconds
 * playbackInfo.nowPlaying
 * playbackInfo.startTime
 * playbackInfo.startTimeSeconds
 */
var playbackInfo = {};

var convertTimeToSeconds = function(timeString) {
    var timeComponents = timeString.split(':');
    var multiplier = 1;
    
    var totalSeconds = 0;

    for(var i = timeComponents.length - 1; i >= 0; i--) {
        totalSeconds += timeComponents[i] * multiplier;
        multiplier *= 60;
    }
    
    return totalSeconds;
};

app.get('/send*', function(req, res) {
    playbackInfo.nowPlaying = req.params[0];
    playbackInfo.startTime = req.query.startTime || '00:00:00'
    playbackInfo.startTimeSeconds = convertTimeToSeconds(playbackInfo.startTime);
    
    res.render('sender', {
       mediaUrl : 'http://' + ipAddress + ':1338/stream/' + playbackInfo.nowPlaying,
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
    
    var videoEncodingType = /(mkv|mp4)$/.test(fileToStream) ? 'copy' : 'libx264';

    var ffmpeg = spawn('ffmpeg', 
        ['-ss', playbackInfo.startTime, '-i', fileToStream, '-c:v', videoEncodingType, '-c:a', 'libfaac', '-ac', '2', '-ab', '192k', '-f', 'matroska', '-']);
        
    var closeFfmpeg = function() {
        playbackInfo = {};
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

var properCase = function(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
};

var normalizeFileName = function(fileName, isDirectory) {
    if (!isDirectory) {
        fileName = fileName.slice(0, -4);
    }

    ['dvdrip', 'bluray', 'ac3'].forEach(function(toExtract) {
        var extractIndex = fileName.toLowerCase().indexOf(toExtract)
        if (extractIndex === -1) { return; }
        fileName = fileName.slice(0,  extractIndex)
    });
        

    return fileName
        .split('.')
        .filter(function(element) {
            return !!element;
        })
        .map(properCase)
        .join(' ');
};

var extractSeasonAndEpisode = function(fileName) {
    var seasonRegexes = [/S(\d\d)e(\d\d)/];
    var matched = seasonRegexes.indexOf(function(seasonRegex) {
        return seasonRegex.test(fileName)
    });
    
    if (matched === -1) {
        return {
            show : fileName
        };
    }
    
    var seasonAndEpisode = seasonRegexes[matched].exec(fileName);
    console.log('what?', seasonAndEpisode);
    return {
        // show : 
    }
};

var nowPlayingString = function() {
    return 'Currently ' + (playbackInfo.nowPlaying ? 'playing ' + playbackInfo.nowPlaying : 'not playing anything');
};

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
        dirContents : mediaDirectories,
        nowPlaying : nowPlayingString()
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
        
        extractSeasonAndEpisode(file);
        
        return {
            displayName : normalizeFileName(file, fileStats.isDirectory()),
            filePath : path.join(filePath, file),
            isDirectory : fileStats.isDirectory(),
            mediaType : 'tv'
        };
    });

    res.render('list', {
       dirContents : dirContents,
       dirPaths : filePath.split('/').filter(function(element) {
           return !!element;
       }) || [],
       nowPlaying : nowPlayingString()
    });
};

app.get('/list', listRootMediaDirectories);
app.get('/list/*', listFiles);

var server = http.createServer(app);
var wss = new WebSocketServer( { server: server } );

server.listen(1338);

var wsIdCounter = 0;
var activeWebsockets = {};

wss.on('connection', function(ws) {
    wsIdCounter++;
    activeWebsockets[wsIdCounter] = ws;
    ws.id = wsIdCounter;

    ws.on('message', function(message) {
        var jsonMessage = JSON.parse(message);
        playbackInfo.currentTimeSeconds = jsonMessage.currentTime;
        
        _.forEach(activeWebsockets, function(activeWebsocket, index) {
            if (activeWebsockets.id === ws.id || activeWebsocket.readyState !== ws.OPEN) { return; }
            activeWebsocket.send(JSON.stringify(playbackInfo));
        });
    });
    
    ws.on('close', function() {
        delete activeWebsockets[ws.idCounter];
    })
});


console.log('listening');