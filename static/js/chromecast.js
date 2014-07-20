var noop = function() {};

var mediaUpdateIntervalId;

var extractMediaFileNameFromPath = function(streamingPath) {
    if (!streamingPath) { return ''; }

    var streamStringStartIndex = streamingPath.lastIndexOf('/');
    if (streamStringStartIndex !== -1) {
        streamingPath = streamingPath.slice(streamStringStartIndex + 1);
    }

    return streamingPath;
};

var loadMedia = function(e, session) {
    clearInterval(mediaUpdateIntervalId);
    var mediaInfo = new chrome.cast.media.MediaInfo(e.target.href, 'video/mkv');
    var request = new chrome.cast.media.LoadRequest(mediaInfo);
    request.autoPlay = true;

    request.currentTime = 0;

    session.loadMedia(request, noop, noop);

    document.getElementById('cur-time').innerText = '';
    document.getElementById('now-playing').innerText = 'Loading ' + extractMediaFileNameFromPath(event.target.href);
    mediaUpdateIntervalId = setInterval(onMediaUpdate.bind(null, session), 1000);
};

// TODO include start time
var onMediaUpdate = function(joinedSession) {
    if (!joinedSession.media || !joinedSession.media[0]) {
        return;
    }

    var mediaSession = joinedSession.media[0];
    console.log(mediaSession);
    if (mediaSession.playerState === chrome.cast.media.PlayerState.IDLE &&
        mediaSession.idleReason !== null) {
        console.log('Media has finished!', mediaSession.idleReason);
    }

    var estimatedTime = mediaSession.getEstimatedTime();

    document.getElementById('cur-time').innerText = convertSecondsToTime(estimatedTime);

    var streamingPath = 'Playing ' + extractMediaFileNameFromPath(mediaSession.media.contentId);

    if (!estimatedTime) {
        streamingPath = 'Not currently playing anything.';
    }

    document.getElementById('now-playing').innerText = streamingPath;
};

var streamingMediaHandler = function(e) {
    if (e.target.tagName.toUpperCase() !== 'A') { return; }

    var classNames = e.target.className;

    if (classNames.indexOf('file') !== -1 && classNames.indexOf('channel') !== -1) { return; }

    chrome.cast.requestSession(loadMedia.bind(null, e), noop);

    e.preventDefault();
};


var onSessionJoined = function(joinedSession) {
    mediaUpdateIntervalId = setInterval(onMediaUpdate.bind(null, joinedSession), 1000);
};

var initializePlayer = function(onSessionJoined) {
    if (!chrome.cast || !chrome.cast.isAvailable) {
        setTimeout(initializePlayer.bind(null, onSessionJoined), 1000);
        return;
    }

    var sessionRequest = new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);

    var apiConfig = new chrome.cast.ApiConfig(sessionRequest, onSessionJoined, noop, chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED);

    chrome.cast.initialize(apiConfig, noop, noop);

    document.addEventListener('click', streamingMediaHandler, false);
};
