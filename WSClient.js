var ws;
if (typeof(window) === 'undefined') {
  ws = require('ws');
}
var util = require('util');
var Client = require('./Client');

var WSClient = function WSClient(url, descriptor, address) {
  var createSocket = function createSocket() {
    var socket;
    if (typeof(window) === 'undefined') {
      socket = new ws.connect(url);
    }
    else {
      socket = new WebSocket(url);
    }
    
    socket.write = function write(data) {
      this.send(data, { binary: true, mask: true });
    }.bind(socket);
    
    if (typeof(window) === 'undefined') {
      socket.on('message', function(data, flags) {
        if (flags.binary === true) {
          this.emit('data', data);
        }
      });
    }
    
    return socket;
  };
  Client.call(this, createSocket, descriptor, address);
};
util.inherits(WSClient, Client);

WSClient.prototype.close = function close() {
  this.closeRequested = true;
  this.socket.close();
};

module.exports = WSClient;