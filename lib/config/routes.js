var fs = require('fs');
var path = require('path');

var requireController = function(controllerName) {
    return require('../controllers/' + controllerName);
};

var requireMiddleware = function(middlewareName) {
  return require('../middleware/' + middlewareName);
};

module.exports = function(app) {
    app.use(requireMiddleware('replace-localhost'));

    app.get('/list', requireController('list-root-directory'));
    app.get('/list/*', requireController('list-directory'));

    app.get('/stream*', requireController('stream-file'));

    app.get('/channels', requireController('next-channel'));
    app.post('/channels*', requireController('add-up-next'));
    app.get('/channels/:channelName', requireController('channels'));
};
