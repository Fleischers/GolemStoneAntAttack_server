// jshint node: true

'use strict';

var winston = require('winston'),
    router = require('./game-server'),
    config = require('nconf');

//TODO change to index.js inside config directory
config.file('./config/config.json').argv();

// 4001 port was once used as TCP port for "Microsoft Ants" game
var port = config.get('port') || 4001,
    io = require('socket.io')(port);

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

io.on('connection', function (socket) {
    winston.info('Connection detected');
    // socket.setNoDelay(true); // disable Nagle's algorithm
    socket.on('message', function (message) {

        winston.info('-> incoming message: %s', message);
        router.processMessage(message, socket, function (err, response, broadcast) {
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
    // speaks holding a bow in his hands:
    vigilante.arrow('You have failed this server!');
    throw error;
});
