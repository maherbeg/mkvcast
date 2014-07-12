var fs = require('fs');
var path = require('path');
var utils = require('../utils');

/**
 * Maps a directory of files to an object containing metadata about each file.
 * @param {String} filePath
 * @return {Function} Containing details on each file in a given filePath
 */
var mapDirectoryContentsToDetailsObject = function(filePath) {
    /**
     * Returns an object with metadata bout a given file.
     * @param {String} file
     * @return {Object}
     */
    return function(file) {
        var fileStats = fs.statSync(path.join(filePath, file));

        return {
            displayName : utils.strings.normalizeFileName(file, fileStats.isDirectory()),
            filePath : path.join(filePath, file),
            isDirectory : fileStats.isDirectory(),
            mediaType : 'tv'
        };
    };
};

/**
 * Splits a directory into its normalized parts.
 * @param {String} filePath
 * @return {Array} Filepath's split by the directory separator.
 */
var extractDirectoryPaths = function(filePath) {
    return filePath.split('/').filter(function(element) {
       return !!element;
   }) || []
};

module.exports = function(req, res) {
    var filePath = req.params[0];

    if (!filePath) {
        require('list-root-directory')(req, res);
    }

    var dirContents = fs.readdirSync(filePath)
        .filter(utils.directory.filterDirectoryContents(filePath))
        .map(mapDirectoryContentsToDetailsObject(filePath));

    res.render('list', {
       dirContents : dirContents,
       dirPaths : extractDirectoryPaths(filePath),
       nowPlaying : ''
    });
};
