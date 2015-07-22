// jshint node: true

'use strict';

var winston = require('winston'),
    port = process.env.PORT || 4001, // 4001 port was used as TCP port for "Microsoft Ants" game
    io = require('socket.io')(port);

io.on('connection', function (socket) {
    winston.info('Connection detected');
    // socket.setNoDelay(true); // disable Nagle's algorithm
    socket.on('message', function (message) {
        winston.info('incoming message: %s', message);
        if (message == 'CONNECT') {
            socket.write('CONNECTED');
        }
    });
    socket.on('disconnect', function () {
        winston.info('client disconnected');
    });
});
