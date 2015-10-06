# Golem Stone: Ant Attack
[![Build Status](https://travis-ci.org/Fleischers/GolemStoneAntAttack_server.svg)](https://travis-ci.org/Fleischers/GolemStoneAntAttack_server)
[![dependencies](https://david-dm.org/Fleischers/GolemStoneAntAttack_server.svg)](https://david-dm.org/Fleischers/GolemStoneAntAttack_server)

This repository stands for game server written in Node.js.    

You can review Unreal Engine 4 client code in the following repository:  
https://github.com/Feliss/GolemStoneAntAttack_client  
Browser client code can be found here:   
https://github.com/Belrestro/GolemStoneAntAttack_browser

## Installation and setup

To install and launch server:

`npm install`  
`npm start`

It will then listen for incoming socket messages.

## Connection
You can connect to server published on Heroku VM: http://antattack.herokuapp.com/

## API
**Notes on variable types:**

**x, y, z,** *{double}* - static coordinates  
**vecX, vecY, vecZ** *{double}* - Vector3 Object  
**playerId** *{string}* - unique player id, for example `xf8i`  
**nickname** *{string}* - any player username  
**speed** *{double}* - player speed  
**acceleration** *{double}* - player acceleration

**|** is delimiter inside message to be able to parse properties  
**~** is delimiter between messages (mark the end of message)

All other are big CONSTANT strings which are special actions.  


### Client to server:

```
CONNECT|nickname~
LOCATION|x|y|z~
MOVE|vecX|vecY|vecZ|speed|acceleration~
ROTATION|vecX|vecY|vecZ~
STOP|x|y|z~
PICK~
THROW|vecX|vecY|vecZ|speed|acceleration~
HIT|playerId~
DEATH~
DISCONNECT~
```

### Server to client:

```
CONNECTED|playerId~
playerId|CONNECTED|nickname~
playerId|LOCATION|x|y|z~
playerId|MOVE|vecX|vecY|vecZ|speed|acceleration~
playerId|STOP|x|y|z~
playerId|PICK~
playerId|THROW|vecX|vecY|vecZ|speed|acceleration~
playerId|HIT~
playerId|DEATH~
playerId|REVIVE~
playerId|DISCONNECT~
```
