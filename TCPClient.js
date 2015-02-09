var net = require('net');
var Client = require('./Client');
var util = require('util');

var TCPClient = function TCPClient(host, port, descriptor, address) {
  var createSocket = function createSocket() {
    var socket = net.connect(port, host);
    socket.setNoDelay(true);
    return socket;
  };
  Client.call(this, createSocket, descriptor, address);
};
util.inherits(TCPClient, Client);

module.exports = TCPClient;