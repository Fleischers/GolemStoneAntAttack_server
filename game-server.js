'use strict';

var winston = require('winston'),
    _ = require('lodash');

var gameServer;
var DELIMITER = '~';

function GameServer() {
    gameServer = this;
    this.idCounter = 0;
    this.players = [];
    this.sockets = [];
}

function route(messageParts, socket, callback) {
    var p, error, reply, broadcast, loc, vector;
    // choose your destiny
    switch (messageParts[0]) {
        case 'CONNECT':
            p = new Player(gameServer.idCounter++, messageParts[1], socket);
            gameServer.players.push(p);
            reply = ('CONNECTED' + '|' + p.id);
            broadcast = (socket, p.id + '|' + 'CONNECTED' + '|' + p.nickname);
            break;
        case 'LOCATION':
            loc = new Location(messageParts[1], messageParts[2], messageParts[3]);
            p = findPlayer(socket, gameServer.players);
            p.location = loc;
            broadcast = (socket, p.id + '|LOCATION|' +
                p.location.x + '|' + p.location.y + '|' + p.location.z);
            break;
        case 'MOVE':
            vector = new Vector(messageParts[1], messageParts[2], messageParts[3]);
            p = findPlayer(socket, gameServer.players);
            p.speed = messageParts[4];
            p.acceleration = messageParts[5];
            p.vector = vector;
            broadcast = (socket, p.id + '|MOVE|' + p.vector + '|' + p.speed +
                '|' + p.acceleration);
            break;
        case 'ROTATE':
            vector = new Vector(messageParts[1], messageParts[2], messageParts[3]);
            p = findPlayer(socket, gameServer.players);
            p.rotateVector = vector;
            broadcast = (socket, p.id + '|MOVE|' + p.rotateVector);
            break;
        case 'STOP':
            loc = new Location(messageParts[1], messageParts[2], messageParts[3]);
            p = findPlayer(socket, gameServer.players);
            p.location = loc;
            broadcast = (socket, p.id + '|STOP|' + p.location);
            break;
        case 'PICK':
            p = findPlayer(socket, gameServer.players);
            broadcast = (socket, p.id + '|' + 'PICK');
            break;
        case 'THROW':
            vector = new Vector(messageParts[1], messageParts[2], messageParts[3]);
            p = findPlayer(socket, gameServer.players);
            p.speed = messageParts[4];
            p.acceleration = messageParts[5];
            p.vector = vector;
            broadcast = (socket, p.id + '|THROW|' + p.vector + '|' + p.speed +
                '|' + p.acceleration);
            break;
        case 'HIT':
            p = findPlayer(socket, gameServer.players);
            broadcast = (socket, p.id + '|' + 'HIT');
            break;
        case 'DEATH':
            p = findPlayer(socket, gameServer.players);
            broadcast = (socket, p.id + '|' + 'DEATH');
            break;
        case 'REVIVE':
            p = findPlayer(socket, gameServer.players);
            broadcast = (socket, p.id + '|' + 'REVIVE');
            break;
        case 'DISCONNECT':
            p = findPlayer(socket, gameServer.players);
            broadcast = (socket, p.id + '|' + 'DISCONNECT');
            break;
        default:
            winston.error('No API for this call');
            error = ('ERROR|' + messageParts);
    }
    // XXX better think more about general rule to use error as it supposed to
    if (error) {
        error = error + DELIMITER;
    }
    if (reply) {
        reply = reply + DELIMITER;
    }
    if (broadcast) {
        broadcast = broadcast + DELIMITER;
    }
    callback(error, reply, broadcast);
}

GameServer.prototype.processMessage = function (data, socket, callback) {
    var contents = data.split(DELIMITER);
    // parse incoming message
    contents.forEach(function (content) {
        if (_.isEmpty(content)) {
            return;
        }
        var messages = content.split('|');
        route(messages, socket, callback);
    });
};

function Player(id, nickname, socket) {
    this.id = id;
    this.nickname = nickname;
    this.socket = socket;
}

function Location(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.toString = function toString() {
        return this.x + '|' + this.y + '|' + this.z;
    };
}

function Vector(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.toString = function () {
        return this.x + '|' + this.y + '|' + this.z;
    };
}

function findPlayer(playerSocket, plys) {
    var p;
    plys.forEach(function (player) {
        if (playerSocket === player.socket) {
            p = player;
        }

    });
    if (!p) {
        winston.error('ERROR: NO PLAYER! Creating new!');
        return new Player(gameServer.idCounter, 'ERRORed Player', playerSocket); //TODO
    } else {
        return p;
    }
}


module.exports = new GameServer();
