var path = require('path');

module.exports = function(app, express) {
    var libRoot = __dirname + '/../';
    
    app.use('/static', express.static(path.resolve(libRoot + '../static')));

    app.set('views', path.resolve(libRoot + 'views'));
    app.set('view engine', 'jade');
};