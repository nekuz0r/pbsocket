var net = require('net');
var util = require('util');
var Client = require('./Client');

var IPCClient = function IPCClient(path, descriptor, address) {
  var createSocket = function createSocket() {
    var socket = net.connect(path);
    return socket;
  };
  Client.call(this, createSocket, descriptor, address);
};
util.inherits(IPCClient, Client);

module.exports = IPCClient;