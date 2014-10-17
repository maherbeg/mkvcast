var fs = require('fs');
var constants = require('./constants');
var path = require('path');

/**
 * Filters out file extensions that are not supported by this application.
 * @param {String} filePath
 * @param {Function} A filter predicate
 */
var filterDirectoryContents = function(filePath) {
    var streamableFileExtensions = constants.streamableFileExtensions;

    /**
     * Checks whether a path starts with or contains a hidden file or a folder.
     * @param {string} source - The path of the file that needs to be validated.
     * returns {boolean} - `true` if the source is blacklisted and otherwise `false`.
     */
    var isUnixHiddenPath = function (path) {
        return (/(^|.\/)\.+[^\/\.]/g).test(path);
    };

    /**
     * A filter predicate for a given file.
     * @param {String} file A file to verify is valid.
     * @return {Boolean} Whether the file is valid or not.
     */
    return function(file) {
        if (isUnixHiddenPath(file)) {
            return false;
        }

        if (fs.statSync(path.join(filePath, file)).isDirectory()) {
            return true;
        }

        return streamableFileExtensions.some(function(fileExt) {
           return file.search(fileExt + '$') !== -1;
        });
    };
};

module.exports = {
    filterDirectoryContents : filterDirectoryContents
};
