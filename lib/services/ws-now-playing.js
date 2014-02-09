var _ = require('lodash');
var WebSocketServer = require('ws').Server;

var playbackInfo = {};

global.playbackInfoEmitter.on('update', function(pi) {
    playbackInfo = pi;
});

/**
 * Creates a web socket server to update the server page with the
 * latest status of the playback state.
 */
module.exports = function(server) {
    var wss = new WebSocketServer( { server: server } );

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
            
            global.playbackInfoEmitter.emit('update', playbackInfo);
        });
    
        ws.on('close', function() {
            delete activeWebsockets[ws.idCounter];
        });
    });    
};