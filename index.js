// jshint node: true

'use strict';

// global require
var winston = require('winston'),
    express = require('express'),
    cors = require('cors'),
    http = require('http'),
    socketIo = require('socket.io'),
    config = require('nconf');

// local require
var gameServer = require('./game-server');

//TODO change to index.js inside config directory
config.file('./config/config.json').argv();

// var host = config.get('host') || 'localhost';

// 4001 port was once used as TCP port for "Microsoft Ants" game
var port = config.get('port') || 4001,
    app = express(),
    server = http.Server(app),
    io = socketIo(server);

app.use(cors()); // enable CORS rules

server.listen(port, function () {
    winston.info('Ant Attack web server is listening on port %d', port);
});

// set custom log levels
var logLevels = {
    levels: {
        // Robert Louis Stevenson:
        // “I had four blak arrows under my belt…
        arrow: 4
        // четыре я стрелы пущу и четверым я отомщу
    },
    colors: {
        arrow: 'red'
    }
};
var vigilante = new (winston.Logger)({
    transports: [ new (winston.transports.Console)({ level: 'arrow' })],
    levels: logLevels.levels,
    colors: logLevels.colors
});
winston.addColors(logLevels.colors);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/README.md');
});

io.on('connection', function (socket) {
    winston.info('Connection detected');
    // socket.setNoDelay(true); // disable Nagle's algorithm
    socket.on('message', function (message) {

        winston.info('-> incoming message: %s', message);
        gameServer.processMessage(message, socket, function (err, response, broadcast) {
            if (err) {
                winston.warn('<- outgoing message: %s', err);
                socket.write(err);
            }
            if (response) {
                winston.info('<- outgoing message: %s', response);
                socket.write(response);
            }
            if (broadcast) {
                winston.info('<- outgoing message: %s', broadcast);
                socket.broadcast.write(broadcast);
            }
        });
    });
    socket.on('disconnect', function () {
        winston.info('client disconnected');
    });
});

io.on('listen', function () {
    winston.info('Server is listening on port %s', port);
});

io.on('error', function (error) {
    // speaks while holding a bow in his hands:
    vigilante.arrow('You have failed this server!');
    throw error;
});
