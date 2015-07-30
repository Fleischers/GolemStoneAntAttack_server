// jshint node: true

'use strict';

var winston = require('winston');

var gameServer;

function GameServer() {
    gameServer = this;
    this.idCounter = 0;
    this.players = [];
    this.sockets = [];
}

GameServer.prototype.processMessage = function (data, socket, callback) {
    var p, error, reply, broadcast, loc, vector;
    winston.info('Routing message %s', data);
    var messages = data.split('|'); // parse incoming message
    switch (messages[0]) {
        case 'CONNECT':
            p = new Player(this.idCounter++, messages[1], socket);
            this.players.push(p);
            reply = ('CONNECTED'+'|'+p.id);
            broadcast = (socket, p.id+'|'+"CONNECTED"+'|'+p.nickname);
            break;
        case 'LOCATION':
            loc = new Location(messages[1],messages[2],messages[3]);
            p = findPlayer(socket, this.players);
            p.location = loc;
            broadcast = (socket, p.id + "|LOCATION|" +
               p.location.x + '|' + p.location.y + '|' + p.location.z);
            break;
        case 'MOVE':
            vector = new Vector(messages[1],messages[2],messages[3]);
            p = findPlayer(socket, this.players);
            p.speed = messages[4];
            p.acceleration = messages[5];
            p.vector = vector;
            broadcast = (socket, p.id + "|MOVE|" + p.vector + "|" + p.speed + "|" + p.acceleration);
            break;
        case 'STOP':
            loc = new Location(messages[1],messages[2],messages[3]);
            p = findPlayer(socket, this.players);
            p.location = loc;
            broadcast = (socket, p.id + "|STOP|" + p.location);
            break;
        case 'PICK':
            p = findPlayer(socket, this.players);
            broadcast = (socket, p.id + "|" + "PICK");
            break;
        case 'THROW':
            vector = new Vector(messages[1],messages[2],messages[3]);
            p = findPlayer(socket, this.players);
            p.speed = messages[4];
            p.acceleration = messages[5];
            p.vector = vector;
            broadcast = (socket, p.id + "|THROW|" + p.vector + "|" + p.speed + "|" + p.acceleration);
            break;
        case 'HIT':
            p = findPlayer(socket, this.players);
            broadcast = (socket, p.id + "|" + "HIT");
            break;
        case 'DEATH':
            p = findPlayer(socket, this.players);
            broadcast = (socket, p.id + "|" + "DEATH");
            break;
        case 'REVIVE':
            p = findPlayer(socket, this.players);
            broadcast = (socket, p.id + "|" + "REVIVE");
            break;
        case 'DISCONNECT':
            p = findPlayer(socket, this.players);
            broadcast = (socket, p.id + "|" + "DISCONNECT");
            break;
        default:
        winston.error("No API for this call");
        error = ("ERROR|"+data);
    }
    callback(error, reply, broadcast);
};

function Player(id, nickname, socket) {
    this.id=id;
    this.nickname=nickname;
    this.socket=socket;
}

function Location (x,y,z) {
    this.x=x;
    this.y=y;
    this.z=z;
    this.toString = function toString() {
        return this.x + "|" + this.y + "|" + this.z;
    };
}

function Vector (x,y,z) {
    this.x=x;
    this.y=y;
    this.z=z;
    this.toString = function () {
        return this.x + "|" + this.y + "|" + this.z;
    };
}


function sendAll(clients,socket,str) {
    clients.forEach(function(client) {
        if (client != socket) {
            client.write(str);
        }
    });
}
function sendAllPlayers(players, socket,str) {
    players.forEach(function(p) {
        if (p.socket != socket) {
            p.socket.write(str);
        }
    });
}
function findPlayer(playerSocket, plys) {
    var p;
    plys.forEach(function(player) {
        if (playerSocket === player.socket) {
            p = player;
        }

    });
    if (!p) {
        winston.error("ERROR: NO PLAYER! Creating new!");
        return new Player(gameServer.idCounter, "ERRORed Player", playerSocket); //TODO
    } else {
        return p;
    }
}


module.exports = new GameServer();
