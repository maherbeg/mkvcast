var noop = function() {};

var initializePlayer = function(onSessionJoined) {
  if (!chrome.cast || !chrome.cast.isAvailable) {
    setTimeout(this.initializePlayer.bind(this, onSessionJoined), 1000);
    return;
  }

  var sessionRequest = new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);

  var apiConfig = new chrome.cast.ApiConfig(sessionRequest, onSessionJoined, noop, chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED);

  chrome.cast.initialize(apiConfig, noop, noop);
};
