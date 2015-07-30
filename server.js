// jshint node: true

'use strict';

var net = require('net');
var crypto = require('crypto');

function randomId (len) {
    if (!len) {
        len = 4;
    }
    return crypto.randomBytes(Math.ceil(len/2))
        .toString('hex') // convert to hexadecimal format
        .slice(0,len);   // return required number of characters
}


var server = net.createServer();
var clients = [];
var players = [];

function Player(id, nickname, socket) {
    this.id=id;
    this.nickname=nickname;
    this.socket=socket;
    this.location = {};
    this.vector = {};
    this.speed = 0.0;
    this.acceleration = 0.0;
    this.toString = function toString() {
        return "id:"+this.id+" nick:"+this.nickname+" location:"+this.location;
    };
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

}
Vector.prototype.toString = function () {
    return this.x + "|" + this.y + "|" + this.z;
};

function sendAll(socket,str) {
    clients.forEach(function(client) {
        if (client != socket) {
            client.write(str);
        }
    });
}
function sendAllPlayers(socket,str) {
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
        console.err("ERROR: NO PLAYER! Creating new!");
        return new Player(randomId(), "ERRORed Player", playerSocket);
    } else {
        return p;
    }
}

server.on('connection', function(socket) {
    console.log('Connection detected');
    socket.setEncoding('utf8');
    socket.setNoDelay(true);
    clients.push(socket);
    clients.forEach(function(c){
        // c.write("Connected users: " + clients.length + "\n");
        console.log("Connected users: " + clients.length + "\n");
    });
    socket.on('data', function(data) {
        console.log(">" + data);
        var messages = data.split('|');
        switch (messages[0]) {
            case 'CONNECT':
                var p = new Player(randomId(), messages[1], socket);
                players.push(p);
                socket.write('CONNECTED'+'|'+p.id);
                sendAllPlayers(socket, p.id+'|'+"CONNECTED"+'|'+p.nickname);
                break;
            case 'LOCATION':
                var loc = new Location(messages[1],messages[2],messages[3]);
                var p = findPlayer(socket, players);
                p.location = loc;
                sendAllPlayers(socket, p.id + "|LOCATION|" + p.location.x + '|' + p.location.y + '|' + p.location.z);
                break;
            case 'MOVE':
                var vector = new Vector(messages[1],messages[2],messages[3]);
                var p = findPlayer(socket, players);
                p.speed = messages[4];
                p.acceleration = messages[5];
                p.vector = vector;
                sendAllPlayers(socket, p.id + "|MOVE|" + p.vector + "|" + p.speed + "|" + p.acceleration);
                break;
            case 'STOP':
                var loc = new Location(messages[1],messages[2],messages[3]);
                var p = findPlayer(socket, players);
                p.location = loc;
                sendAllPlayers(socket, p.id + "|STOP|" + p.location);
                break;
            case 'PICK':
                var p = findPlayer(socket, players);
                sendAllPlayers(socket, p.id + "|" + "PICK");
                break;
            case 'THROW':
                var vector = new Vector(messages[1],messages[2],messages[3]);
                var p = findPlayer(socket, players);
                p.speed = messages[4];
                p.acceleration = messages[5];
                p.vector = vector;
                sendAllPlayers(socket, p.id + "|THROW|" + p.vector + "|" + p.speed + "|" + p.acceleration);
                break;
            case 'HIT':
                var p = findPlayer(socket, players);
                sendAllPlayers(socket, p.id + "|" + "HIT");
                break;
            case 'DEATH':
                var p = findPlayer(socket, players);
                sendAllPlayers(socket, p.id + "|" + "DEATH");
                break;
            case 'REVIVE':
                var p = findPlayer(socket, players);
                sendAllPlayers(socket, p.id + "|" + "REVIVE");
                break;
            case 'DISCONNECT':
                var p = findPlayer(socket, players);
                sendAllPlayers(socket, p.id + "|" + "DISCONNECT");
                break;
            default:
            console.error("No API for this call");
            socket.write("ERROR|"+data);
        }

    });
    socket.on('close', function() {
        console.log("Connection closed");
        var index = clients.indexOf(socket);
        clients.splice(index,1);
        console.log(clients.length);
    });
});
server.on('close', function(closed) {
    console.log("Server is closed");
    console.log(closed);
});
server.on('error', function(err) {
    console.error(err);
});

var port = process.env.PORT || 4000,
    host = process.env.HOST || "localhost";
server.listen(port, host);
server.on('listening', function(){
    console.log("Server is listening to " +  host + ":" + port);
});
