# mkvcast
A barebones on the fly video transcoder for [Chromecasts](https://developers.google.com/cast/).

## Installation
### Mac OS X
The easiest way to install this is via [Homebrew](http://brew.sh)
```bash
brew install git
brew install ffmpeg
brew install node
git clone https://github.com/maherbeg/mkvcast.git
cd mkvcast
npm install
npm install -g bower
bower install
node ./lib/mkvcast <config file>
open 'http://localhost:1338/list'
```

## Configuration
### config.json
The following keys need to be saved in a 'config.json' that is passed into the application.
```json
{
    "mediaDirectories" : [
        "/Users/someuser/Downloads/",
        "/Volumes/harddrive/Media/"
    ]
}
```

## Todo
* ~~A responsive sender UI that will show all the files to serve~~ as well as a list of Chromecasts to serve.
* Interface for pausing/playing/setting the volume of the Chromecast
* Better documentation
* Testing
* Playlist functionality
* Channel functionality. Assign a folder list to a channel and serve up random videos from these folders.

## Things it can't do
* Fast forward/reverse through a video

## Contributing
Pull requests are graciously accepted. Feel free to open up issues as well.

This code is MIT Licensed.
