// jshint node: true

'use strict';

var winston = require('winston'),
    router = require('./game-server'),
    port = process.env.PORT || 4001, // 4001 port was used as TCP port for "Microsoft Ants" game
    io = require('socket.io')(port);

io.on('connection', function (socket) {
    winston.info('Connection detected');
    // socket.setNoDelay(true); // disable Nagle's algorithm
    socket.on('message', function (message) {
        winston.info('incoming message: %s', message);
        router.processMessage(message, socket, function (err, response, broadcast) {
            socket.write(response);
            socket.broadcast.write(broadcast);
        });
    });
    socket.on('disconnect', function () {
        winston.info('client disconnected');
    });
});

io.on('error', function (error) {
    throw error;
});
