// jshint node: true

'use strict';

// global require
var winston = require('winston'),
    express = require('express'),
    favicon = require('serve-favicon'),
    boom = require('express-boom'),
    cors = require('cors'),
    http = require('http'),
    socketIo = require('socket.io'),
    config = require('nconf');

// local require
var gameServer = require('./game-server');


//TODO change to index.js inside config directory
config.file('./config/config.json').argv();

// TODO add possibility to not work with logentries
if (process.env.LOGENTRIES || config.get('logentries:enabled')) {
    winston.add(winston.transports.Logentries, {
            token: process.env.LOGENTRIES || config.get('logentries:token')
        });
} else {
    winston.remove(winston.transports.Console);
    winston.add(winston.transports.Console, {
        level: config.get('loglevel'),
        colorize: true,
        humanReadableUnhandledException: true
    });
}

// var host = config.get('host') || 'localhost';

// 4001 port was once used as TCP port for "Microsoft Ants" game
var DEFAULT_PORT = 4001;

var port = process.env.PORT || config.get('port') || DEFAULT_PORT,
    app = express(),
    server = http.Server(app),
    io = socketIo(server);

app.use(favicon(__dirname + '/favicon.ico'));
app.use(cors()); // enable CORS rules
app.use(boom());

server.listen(port, function () {
    winston.info('Ant Attack web server is listening on port %d', port);
});

// set custom log levels
var logLevels = {
    levels: {
        // Robert Louis Stevenson:
        // “I had four blak arrows under my belt…
        arrow: 4
        // четыре я стрелы пущу и четверым я отомщу
    },
    colors: {
        silly: 'grey',
        verbose: 'cyan',
        debug: 'green',
        info: 'blue',
        warn: 'yellow',
        error: 'red',
        arrow: 'red'
    }
};
var vigilante = new (winston.Logger)({
    transports: [ new (winston.transports.Console)({ level: 'arrow' })],
    levels: logLevels.levels,
    colors: logLevels.colors
});

winston.addColors(logLevels.colors);

app.use(function (req, res, next) {
    winston.info('HTTP request', req.ip, req.method, req.url);
    next();
});

app.engine('md', require('marked-engine').renderFile);
app.get('/', function (req, res) {
    res.render(__dirname + '/README.md');
});

app.get('/chat', function (req, res) {
    res.send('Here should be a chat');
    winston.warn('No chat! Someone trying to find it');
});

app.get('/game', function (req, res) {
    res.send('Here should be the game');
    winston.debug(req);
});

app.use(function (req, res) {
    res.boom.notFound(); // Responsds with a 404 status code
});

io.on('connection', function (socket) {
    winston.info('SOCKET Connection detected');
    // socket.setNoDelay(true); // disable Nagle's algorithm
    socket.on('message', function (message) {

        winston.info('-> incoming message: %s', message);
        gameServer.processMessage(message, socket, function (err, response, broadcast) {
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
        winston.info('SOCKET client disconnected');
    });
});

io.on('listen', function () {
    winston.info('Server is listening on port %s', port);
});

io.on('error', function (error) {
    // speaks while holding a bow in his hands:
    vigilante.arrow('You have failed this server!');
    throw error;
});
