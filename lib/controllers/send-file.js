var utils = require('../utils');

module.exports = function(req, res) {
    res.render('sender', {
       mediaUrl : 'http://' + utils.network.ipAddress + ':1338/stream/' + req.params[0]
    });
};
