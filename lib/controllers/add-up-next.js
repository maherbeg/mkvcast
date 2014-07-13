var upnext = require('../utils').upnext;

module.exports = function(req, res) {
    var mediaFile = req.params[0];

    upnext.put(mediaFile);

    res.redirect(req.get('referer'));
};
