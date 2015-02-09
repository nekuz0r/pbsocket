var net = require('net');
var util = require('util');
var Server = require('./Server');

var TCPServer = function TCPServer(port, descriptor, address) {
  var createSocket = function createSocket(listenHandler) {
    var socket = net.createServer();
    
    socket.on('connection', function(clientSocket) {
      clientSocket.setNoDelay(true);
    });
    
    socket.listen(port);
    return socket;
  };
  Server.call(this, createSocket, descriptor, address);
};
util.inherits(TCPServer, Server);

module.exports = TCPServer;