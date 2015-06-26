var net = require('net');
var fs = require('fs');
var yaml = require('js-yaml');
var crypto = require('crypto');

function randomId (len) {
    if (!len) {
        var len = 4;
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
    this.loc;
    this.vec;
}
function Location (x,y,z) {
    this.x=x;
    this.y=y;
    this.z=z;
}
function Vector (x,y,z) {
    this.x=x;
    this.y=y;
    this.z=z;
}

try {
  var host = yaml.safeLoad(fs.readFileSync('./host.yml', 'utf8'));
  console.log(host.ip);
} catch (e) {
  console.error(e);
}

function sendAll(socket,str) {
    clients.forEach(function(client) {
        if (client != socket) {
            client.write(str);
        }
    });
}

server.on('connection', function(socket) {
    console.log('Connection detected');
    socket.setEncoding('utf8');
    clients.push(socket);
    clients.forEach(function(c){
        c.write("Connected users: " + clients.length + "\n");
    });
    socket.on('data', function(data) {
        console.log(data);
        var messages = data.split('|');
        switch (messages[0]) {
            case 'CONNECT':
                var p = new Player(randomId(), messages[1], socket);
                players.push(p);
                socket.write('CONNECTED'+'|'+p.id);
                sendAll(socket, p.id+'|'+"CONNECTED"+'|'+p.nickname);
                break;
            case 'LOCATION':
                var loc = new Location(messages[1],messages[2],messages[3]);

                break;
            case 'MOVE':

                break;
            case 'STOP':

                break;
            case 'PICK':

                break;
            case 'THROW':

                break;
            case 'HIT':

                break;
            case 'DEATH':

                break;
            case 'DISCONNECT':

                break;

            default:
            clients.forEach(function(client) {
                if (client != socket) {
                    client.write(data);
                }
            });
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

server.listen((process.env.PORT || 4000), process.env.HOST||host.ip);
server.on('listening', function(){
    console.log("Server is listening");
});
