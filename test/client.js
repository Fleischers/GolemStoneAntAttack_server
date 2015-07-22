// jshint node: true
// jshint mocha: true

'use strict';

var config = require('nconf'),
    winston = require('winston'),
    should = require('should'),
    io = require('socket.io-client');

config.file('./config/config.json');

describe('Client', function () {
    this.timeout(10000);

    var host = config.get('test:host'),
        port = config.get('test:port'),
        url = 'http://' + host + ':' + port + '/';
    winston.info('connecting to %s', url);

    it('should connect to socket server', function (done) {
        var socket = io(url);
        socket.on('connect', function () {
            winston.info('connected to %s', url);
            socket.send('CONNECT');
            socket.on('message', function (msg) {
                winston.info(msg);
                msg.should.be.exactly('CONNECTED');
                done();
            });
        });
    });
});
