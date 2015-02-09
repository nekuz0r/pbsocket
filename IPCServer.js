var net = require('net');
var util = require('util');
var Server = require('./Server');

var IPCServer = function IPCServer(path, descriptor, address) {
  var createSocket = function createSocket(listenHandler) {
    var socket = net.createServer();
    socket.listen(path);
    return socket;
  };
  Server.call(this, createSocket, descriptor, address);
};
util.inherits(IPCServer, Server);

module.exports = IPCServer;