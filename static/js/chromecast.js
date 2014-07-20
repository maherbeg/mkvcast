var noop = function() {};

var currentSession;
var mediaUpdateIntervalId;

var extractMediaFileNameFromPath = function(streamingPath) {
    if (!streamingPath) { return; }

    var streamStringStartIndex = streamingPath.lastIndexOf('/');
    if (streamStringStartIndex !== -1) {
        streamingPath = streamingPath.slice(streamStringStartIndex + 1);
    }

    return streamingPath;
};

var loadMedia = function(target, session) {
    clearInterval(mediaUpdateIntervalId);

    var mediaPath = target.href;

    var mediaInfo = new chrome.cast.media.MediaInfo(mediaPath, 'video/mkv');
    var request = new chrome.cast.media.LoadRequest(mediaInfo);
    request.autoPlay = true;

    request.currentTime = 0;

    session.loadMedia(request, noop, noop);

    var mediaName = extractMediaFileNameFromPath(mediaPath);

    document.getElementById('cur-time').innerText = '';
    document.getElementById('now-playing').innerText = 'Loading ' + mediaName;
    mediaUpdateIntervalId = setInterval(onMediaUpdate.bind(null, session), 1000);

    var currentLocation = window.location.href;
    var currentTitle = window.title;
    window.history.replaceState(null, mediaName, mediaPath);
    window.history.replaceState(null, currentTitle, currentLocation);
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
    var target = e.target;

    if (!target || target.tagName.toUpperCase() !== 'A') {
        target = target.parentElement;

        if (!target || target.tagName.toUpperCase() !== 'A') {
            return;
        }
    }

    if (target.href.indexOf('/stream/') === -1) { return; }

    if (currentSession) {
        loadMedia(target, currentSession);
    } else {
        chrome.cast.requestSession(loadMedia.bind(null, target), noop);
    }

    e.preventDefault();
};


var onSessionJoined = function(joinedSession) {
    currentSession = joinedSession
    mediaUpdateIntervalId = setInterval(onMediaUpdate.bind(null, joinedSession), 1000);
};

document.addEventListener('click', noop);

window['__onGCastApiAvailable'] = function(loaded, errorInfo) {
    if (!loaded) { return console.log(errorInfo); }

    var sessionRequest = new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);

    var apiConfig = new chrome.cast.ApiConfig(sessionRequest, onSessionJoined, noop, chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED);

    chrome.cast.initialize(apiConfig, noop, noop);

    document.removeEventListener('click', noop);
    document.addEventListener('click', streamingMediaHandler, false);
};
