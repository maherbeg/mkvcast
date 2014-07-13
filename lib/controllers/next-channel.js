var upnext = require('../utils').upnext;

module.exports = function(req, res) {
    // var channelName = req.session.channelName;
    //
    // if (channelName) {
    //     return res.redirect('/channels/' + channelName);
    // }

    var nextFile = upnext.get();
    if (!nextFile) {
        return res.send(404);
    }

    res.redirect('/stream/' + nextFile);
};
