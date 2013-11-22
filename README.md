# mkvcast
A barebones on the fly video transcoder for [Chromecasts](https://developers.google.com/cast/).

## Installation
You'll need to have a [whitelisted](https://developers.google.com/cast/whitelisting#whitelist-receiver) Chromecast and a place to host the receiver.html file.
### Modify the receiver app
Update the static/receiver.html files with your app id.

Upload the static/receiver.html file to the URL endpoint you specified when you had your Chromecast whitelisted.

_Note:_Ideally the Chromecast team will have a basic video player available for everyone to use. Until then, you'll need to host and whitelist your own.

### Mac OS X
The easiest way to install this is via [Homebrew](http://brew.sh)
```bash
brew install git
brew install ffmpeg
brew install node
git clone https://github.com/maherbeg/mkvcast.git
cd mkvcast
npm install
node ./lib/mkvcast <config file>
open 'http://localhost:1338/sender'
```

## Configuration
### config.json
The following keys need to be saved in a 'config.json' that is passed into the application.
```json
{
    "applicationId" : "Your app ID here",
    "mediaDirectories" : [
        "/Users/someuser/Downloads/",
        "/Volumes/harddrive/Media/"
    ]
}
```
### mkvcast.config.js
Place a javascript file in the same directory as where your receiver.html file lives.
```javascript
var appId = 'Your app ID here';
```

## Todo
* A responsive sender UI that will show all the files to serve as well as a list of Chromecasts to serve.
* Interface for pausing/playing/setting the volume of the Chromecast
* UI on the Chromecast
* Better documentation
* Testing
* Playlist functionality
* Channel functionality. Assign a folder list to a channel and serve up random videos from these folders.

## Things it can't do
* Fast forward/reverse through a video

## Contributing
Pull requests are graciously accepted. Feel free to open up issues as well.

This code is MIT Licensed.