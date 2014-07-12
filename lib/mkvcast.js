var events = require('events');
var express = require('express');
var fs = require('fs');
var http = require('http');

if (!process.argv[2] || !fs.existsSync(process.argv[2])) {
    console.log('Configuration file missing or not specified as an argument!')
    process.exit(1);
}

global.config = require(process.argv[2]);

if (!config['mediaDirectories']) {
    console.log('mediaDirectories not specified.');
}

var app = express();

require('./config/environment')(app, express);
require('./config/routes')(app);

var server = http.createServer(app);

server.listen(1338);
