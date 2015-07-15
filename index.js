// jshint node: true

'use strict';

var winston = require('winston'),
    port = process.env.PORT || 4001, // 4001 port was used as TCP port for "Microsoft Ants" game
    io = require('socket.io')(port);

io.on('connection', function (socket) {
    socket.on('message', function (message) {
        winston.info('incoming message: %s', message);
    });
    socket.on('disconnect', function () {
        winston.info('client disconnected');
    });
});
