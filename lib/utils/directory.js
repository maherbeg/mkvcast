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

module.exports = {
    filterDirectoryContents : filterDirectoryContents
};
