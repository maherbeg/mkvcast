var path = require('path');

var seasonRegexes = [
    /[sS](\d\d)[eE]?(\d\d)?/,
    /((\d)?\d)?(\d\d)/,
    /\[(\d)(\d\d)\]/
];

module.exports = {
    /**
     * Converts a time string of the format [HH:]MM:SS into seconds.
     * @param {String} Time string with at least minutes and seconds delimited by a colon.
     * @return {Number} Number of seconds this time string represnts.
     */
    convertTimeToSeconds : function(timeString) {
        var timeComponents = timeString.split(':');
        var multiplier = 1;

        var totalSeconds = 0;

        for(var i = timeComponents.length - 1; i >= 0; i--) {
            totalSeconds += timeComponents[i] * multiplier;
            multiplier *= 60;
        }

        return totalSeconds;
    },

    /**
     * Extracts out metadata based on the filename such
     * as season number and episode number.
     * @param {String} filePath
     * @param {String} fileName
     * @param {fs.Stats} fileStats
     * @return {Object}
     */
    extractMediaInfo : function(filePath, fileName, fileStats) {
        var displayName = this.normalizeFileName(fileName, fileStats.isDirectory());

        var season;
        var episode;

        var matchedRegex;

        seasonRegexes.forEach(function(seasonRegex) {
            var seasonMatch = seasonRegex.exec(displayName);

            if (!seasonMatch || !seasonMatch[1]) { return; }

            // If a season was already found, then skip out.
            if (season) { return; }

            if (!seasonMatch[2]) {
                episode = +seasonMatch[1];
                matchedRegex = seasonRegex;
                return;
            }

            season = +seasonMatch[1];
            episode = +seasonMatch[2];

            matchedRegex = seasonRegex;
        });

        if (matchedRegex) {
            displayName = displayName.replace(matchedRegex, '');
            displayName = displayName.slice(0, displayName.lastIndexOf('.'));
        }

        return {
            displayName: displayName,
            filePath: path.join(filePath, fileName),
            episode: episode,
            isDirectory: fileStats.isDirectory(),
            mediaType: (!fileStats.isDirectory() && !episode) ? 'movie' : 'tv',
            season: season
        };
    },

    /**
     * Normalizes a file name by extracting out the extension and then
     * stripping out any extraneous information in the title.
     * @param {String} fileName
     * @param {Boolean} isDirectory
     * @return {String} A simpler file title.
     */
    normalizeFileName : function(fileName, isDirectory) {
        if (!isDirectory) {
            fileName = fileName.slice(0, -4);
        }

        ['480p', '720p', '1080p'].forEach(function(toExtract) {
            var extractIndex = fileName.toLowerCase().indexOf(toExtract)
            if (extractIndex === -1) { return; }

            // Extract out all of the extraneous parts of the file name and include the trailing '.'
            fileName = fileName.slice(0,  extractIndex - 1)

            // Extract out the year as well
            if (!/(19|20)\d\d$/.test(fileName)) { return; }
            fileName = fileName.slice(0, -4);
        });


        return fileName
            .split('.')
            .filter(function(element) {
                return !!element;
            })
            .map(this.properCase)
            .join(' ');
    },

    /**
     * Proper cases a title by uppercasing the first letter.
     * @param {String} word
     * @return {String}
     */
    properCase : function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }
};
