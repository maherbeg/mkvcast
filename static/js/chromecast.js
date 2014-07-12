var noop = function() {};

var loadMedia = function(session, event) {
  var mediaInfo = new chrome.cast.media.MediaInfo(event.target.href, 'video/mkv');
  var request = new chrome.cast.media.LoadRequest(mediaInfo);
  request.autoPlay = true;

  request.currentTime = 0;

  session.loadMedia(request, noop, noop);

  event.preventDefault();
};

// TODO include start time
var onMediaUpdate = function(mediaSession) {
  document.getElementById('cur-time').innerText = convertSecondsToTime(mediaSession.getEstimatedTime());

  var streamingPath = mediaSession.media.contentId;
  var streamStringStart = '/stream/';
  var streamStringStartIndex = streamingPath.indexOf(streamStringStart);
  if (streamStringStartIndex !== -1) {
    streamingPath = streamingPath.slice(streamStringStartIndex + streamStringStart.length + 1);
  }

  if (!mediaSession.getEstimatedTime()) {
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

    if (!joinedSession.media || !joinedSession.media[0]) { return; }

    var mediaSession = joinedSession.media[0];
    setInterval(onMediaUpdate.bind(null, mediaSession), 1000);
};

var initializePlayer = function(onSessionJoined) {
  if (!chrome.cast || !chrome.cast.isAvailable) {
    setTimeout(initializePlayer.bind(null, onSessionJoined), 1000);
    return;
  }

  var sessionRequest = new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);

  var apiConfig = new chrome.cast.ApiConfig(sessionRequest, onSessionJoined, noop, chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED);

  chrome.cast.initialize(apiConfig, noop, noop);
};
