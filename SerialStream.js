var SerialPort = require('serialport').SerialPort;
var util = require('util');
var Client = require('./Client');

var SerialStream = function SerialStream(path, opts, descriptor, address) {
  var createSocket = function createSocket() {
    var socket = new SerialPort(path, opts);
    return socket;
  };
  Client.call(this, createSocket, descriptor, address);
};
util.inherits(SerialStream, Client);

SerialStream.prototype.close = function close() {
  this.closeRequested = true;
  this.socket.flush(function() {
    setTimeout(this.socket.close.bind(this.socket), 10);
  }.bind(this));
};

module.exports = SerialStream;