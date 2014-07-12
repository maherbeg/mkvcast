var ip = require('ip');

module.exports = function(req, res, next) {
    if (/localhost/.test(req.headers.host)) {
        return res.redirect('http://' + req.headers.host.replace('localhost', ip.address()) + req.url);
    }

    next();
};
