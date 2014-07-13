var noop = function() {};

var mediaUpdateIntervalId;

var extractMediaFileNameFromPath = function(streamingPath) {
    var streamStringStartIndex = streamingPath.lastIndexOf('/');
    if (streamStringStartIndex !== -1) {
        streamingPath = streamingPath.slice(streamStringStartIndex + 1);
    }

    return streamingPath;
};

var loadMedia = function(session, event) {
    clearInterval(mediaIntervalUpdateId);
    var mediaInfo = new chrome.cast.media.MediaInfo(event.target.href, 'video/mkv');
    var request = new chrome.cast.media.LoadRequest(mediaInfo);
    request.autoPlay = true;

    request.currentTime = 0;

    session.loadMedia(request, noop, noop);

    document.getElementById('cur-time').innerText = '';
    document.getElementById('now-playing').innerText = 'Loading ' + extractMediaFileNameFromPath(event.target.href);
    mediaIntervalUpdateId = setInterval(onMediaUpdate.bind(null, session), 1000);

    event.preventDefault();
};

// TODO include start time
var onMediaUpdate = function(joinedSession) {
    if (!joinedSession.media || !joinedSession.media[0]) {
        console.log('hello?');
        return;
    }

    var mediaSession = joinedSession.media[0];
    var estimatedTime = mediaSession.getEstimatedTime();

    document.getElementById('cur-time').innerText = convertSecondsToTime(estimatedTime);

    var streamingPath = extractMediaFileNameFromPath(mediaSession.media.contentId);

    if (!estimatedTime) {
        streamingPath = 'Not currently playing anything.';
    }

    document.getElementById('now-playing').innerText = streamingPath;
};

var addClickHandlerForQuerySelector = function(session, querySelector) {
    var loadMediaForSession = loadMedia.bind(null, session);
    var allLinks = document.querySelectorAll(querySelector);

    Array.prototype.forEach.call(allLinks, function(val, index) {
        val.addEventListener('click', loadMediaForSession);
    });
};

var onSessionJoined = function(joinedSession) {
    if (!joinedSession) {
        return;
    }

    addClickHandlerForQuerySelector(joinedSession, 'a.channel');
    addClickHandlerForQuerySelector(joinedSession, 'a.file');

    mediaIntervalUpdateId = setInterval(onMediaUpdate.bind(null, joinedSession), 1000);
};

var initializePlayer = function(onSessionJoined) {
    if (!chrome.cast || !chrome.cast.isAvailable) {
        setTimeout(initializePlayer.bind(null, onSessionJoined), 1000);
        return;
    }

    var sessionRequest = new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);

    var apiConfig = new chrome.cast.ApiConfig(sessionRequest, onSessionJoined, noop, chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED);

    chrome.cast.initialize(apiConfig, chrome.cast.requestSession.bind(null, noop, noop), noop);
};
