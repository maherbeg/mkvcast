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

        ['dvdrip', 'bluray', 'ac3'].forEach(function(toExtract) {
            var extractIndex = fileName.toLowerCase().indexOf(toExtract)
            if (extractIndex === -1) { return; }
            fileName = fileName.slice(0,  extractIndex)
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
     * Return a formatted now playing string.
     * @param {String} playbackInfo.nowPlaying
     * @return {String} A now playing string.
     */
    nowPlayingString : function(playbackInfo) {
        return 'Currently ' + (playbackInfo.nowPlaying ? 'playing ' + playbackInfo.nowPlaying : 'not playing anything');
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