var util = require('util');
var Stream = require('./Stream');

var Client = function Client(createSocket, descriptor, address) {
  this.closeRequested = false;
  this.connected = false;
  
  var connectHandler = function connectHandler() {
    this.connected = true;
    this.emit('connect', this);
  }.bind(this);
  
  var closeHandler = function closeHandler() {
    this.connected = false;
    if (this.closeRequested === false) {
      setTimeout(connect, 10 * 1000);
    }
    this.emit('disconnect', this);
  }.bind(this);
  
  var errorHandler = function errorHandler(error) {
    
  }.bind(this);
  
  var connect = function connect() {
    this.socket = createSocket();
    if (typeof(window) === 'undefined') {
      this.socket.on('connect', connectHandler);
      this.socket.on('open', connectHandler);
      this.socket.on('close', closeHandler);
      this.socket.on('error', errorHandler);
    }
    else {
      this.socket.binaryType = "arraybuffer";
      this.socket.onopen = connectHandler;
      this.socket.onclose = closeHandler;
      this.socket.onerror = errorHandler;
    }
    Stream.call(this, descriptor, this.socket, address);
  }.bind(this);
  
  connect();
};
util.inherits(Client, Stream);

Client.prototype.send = function send() {
  if (this.connected === true) {
    Stream.prototype.send.apply(this, arguments);
  }
};

Client.prototype.close = function close() {
  this.closeRequested = true;
  this.socket.end();
};

module.exports = Client;