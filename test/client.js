// jshint node: true
// jshint mocha: true

'use strict';

var config = require('nconf'),
    winston = require('winston'),
    should = require('should'),
    io = require('socket.io-client');

config.argv().file('./config/config.json');

describe('Client', function () {
    this.timeout(10000);

    var host = config.get('test:host'),
        port = config.get('test:port'),
        url = 'http://' + host + ':' + port + '/';
    winston.info('connecting to %s', url);

    var playerId;
    var socket = io(url);

    it('should connect to socket server', function (done) {
        socket.on('connect', function () {
            winston.info('connected to %s', url);
            socket.send('CONNECT|Tester');
            socket.send('LOCATION|14.2|100.1|3.9');
            socket.send('MOVE|10.2|10.7|1.0|1.0|1.1');
            socket.send('STOP|5.0|10.2|30.0');
            socket.send('PICK');
            socket.send('THROW|10.2|10.7|1.0|1.0|1.1');
            socket.send('HIT|0');
            socket.send('DEATH');
            socket.send('DISCONNECT');

            socket.on('message', function (msg) {
                winston.info(msg);
                var contents = msg.split('|');
                playerId = contents[1];
                try {
                    msg.should.be.exactly('CONNECTED|0');
                } finally {
                    // socket.close();
                }
                done();
            });
        });
    });

    it('should send Location', function (done) {
        socket.send('LOCATION|14.2|100.1|3.9');
        done();
    });



});
