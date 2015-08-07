# Golem Stone: Ant Attack
[![Build Status](https://travis-ci.org/Fleischers/GolemStoneAntAttack_server.svg?branch=8-create-routes-with-express-on)](https://travis-ci.org/Fleischers/GolemStoneAntAttack_server)
![dependencies](https://david-dm.org/Fleischers/GolemStoneAntAttack_server.svg)

This repository stands for game server written in Node.js.  
You can review Unreal Engine 4 client code in the following repository: https://github.com/Feliss/GolemStoneAntAttack_client

## Installation and setup

To install and launch server:

`npm install`  
`npm start`

It will then listen for incoming socket messages.

## Connection
You can connect to server published on Heroku VM: http://antattack.herokuapp.com/

## API

### Client to server:

```
CONNECT|NICKNAME~
LOCATION|X|Y|Z~
MOVE|X|Y|Z|SPEED|ACCELERATION~
STOP|X|Y|Z~
PICK~
THROW|X|Y|Z|SPEED|ACCELERATION~
HIT|PLAYER_ID~
DEATH~
DISCONNECT~
```

### Server to client:

```
CONNECTED|PLAYER_ID~
PLAYER_ID|CONNECTED|NICKNAME~
PLAYER_ID|LOCATION|X|Y|Z~
PLAYER_ID|MOVE|X|Y|Z|SPEED|ACCELERATION~
PLAYER_ID|STOP|X|Y|Z~
PLAYER_ID|PICK~
PLAYER_ID|THROW|X|Y|Z|SPEED|ACCELERATION~
PLAYER_ID|HIT~
PLAYER_ID|DEATH~
PLAYER_ID|REVIVE~
PLAYER_ID|DISCONNECT~
```
