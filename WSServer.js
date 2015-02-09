var ws = require('ws').Server;
var util = require('util');
var Server = require('./Server');

var WSServer = function WSServer(port, descriptor, address) {
  var createSocket = function createSocket(listenHandler) {
    var socket = new ws({ port: port });
    
    socket.on('connection', function(clientSocket) {
      clientSocket.write = function write(data) {
        this.send(data, { binary: true });
      }.bind(clientSocket);
      
      clientSocket.on('message', function(data, flags) {
        if (flags.binary === true) {
          this.emit('data', data);
        }
      });
    });
    
    return socket;
  };
  Server.call(this, createSocket, descriptor, address);
};
util.inherits(WSServer, Server);

WSServer.prototype.close = function close() {
  this.socket.close();
};

module.exports = WSServer;