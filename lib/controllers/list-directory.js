var fs = require('fs');
var path = require('path');
var utils = require('../utils');

/**
 * Filters out file extensions that are not supported by this application.
 * @param {String} filePath
 * @param {Function} A filter predicate
 */
var filterDirectoryContents = function(filePath) {
    var streamableFileExtensions = utils.constants.streamableFileExtensions;

    /**
     * A filter predicate for a given file.
     * @param {String} file A file to verify is valid.
     * @return {Boolean} Whether the file is valid or not.
     */
    return function(file) {

        if (fs.statSync(path.join(filePath, file)).isDirectory()) {
            return true;
        }

        return streamableFileExtensions.some(function(fileExt) {
           return file.search(fileExt + '$') !== -1;
        });
    };
};

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
        .filter(filterDirectoryContents(filePath))
        .map(mapDirectoryContentsToDetailsObject(filePath));

    res.render('list', {
       dirContents : dirContents,
       dirPaths : extractDirectoryPaths(filePath),
       nowPlaying : ''
    });
};
