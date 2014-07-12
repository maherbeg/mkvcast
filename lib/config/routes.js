var fs = require('fs');
var path = require('path');

var requireController = function(controllerName) {
    return require('../controllers/' + controllerName);
};

module.exports = function(app) {
    app.get('/list', requireController('list-root-directory'));
    app.get('/list/*', requireController('list-directory'));

    app.get('/stream*', requireController('stream-file'));
};
