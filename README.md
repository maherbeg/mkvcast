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
./bin/mkvcast <config file>
open 'http://localhost:1338/list'
```

### FreeBsd
You should install everything from a [FreeBSD Jail](http://www.freebsd.org/doc/handbook/jails-build.html)
```bash
pkg install ffmpeg
pkg install node
pkg install npm
pkg install git
git clone https://github.com/maherbeg/mkvcast.git
cd mkvcast
npm install
npm install -g bower
bower install
./bin/mkvcast <config file>
open 'http://localhost:1338/list'
```

### Windows
Currently broken, path handling needs to be fixed for this platform. See #18

Download and run an installer from http://nodejs.org/download/ (you will also need git installed from http://git-scm.com/download/win)
Then from `cmd` or `powershell`:
```bash
git clone https://github.com/maherbeg/mkvcast.git
cd mkvcast
npm install
npm install -g bower
bower install
node lib\mkvcast.js C:\full\path\to\config.json
```

*Note: For the moment on Windows, you'll need to escape paths in config.json - e.g. C:\Movies becomes C:\\Movies*



## Configuration
### config.json
The following keys need to be saved in a `config.json` that is passed into the application.

```json
{
    "mediaDirectories" : [
        "/Users/someuser/Downloads/",
        "/Volumes/harddrive/Media/"
    ]
}
```



#### channels
A channel is a set of directories to randomly view videos from. Think of it as a shuffled
playlist based on your content. You can create channels for genres, directors etc.

Just simply add another configuration option to your `config.json` file called `channels`.
The key is the channel name with an entry of directories specifying the directories you would
like to view.

***Note*** It is not traversing nested directories yet.
```json
{
    "channels" : {
        "new" : {
            "directories" : ["/Users/someuser/Downloads", "/Volumes/harddrive/Media/NotWatched"]
        }
    }
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
