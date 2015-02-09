var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Long, ByteBuffer;
if (typeof(window) === 'undefined') {
  Long = require('long');
  ByteBuffer = require('bytebuffer');
}
else {
  Long = dcodeIO.Long;
  ByteBuffer = dcodeIO.ByteBuffer;
}

var Messenger = require('./Message');

var BROADCAST_ADDRESS = new Long(0, 0, true);

var Stream = function Stream(descriptors, socket, address) {
  EventEmitter.call(this);
  
  this.messenger = new Messenger(descriptors);
  this.address = Long.fromValue(address || BROADCAST_ADDRESS);
  this.data = new ByteBuffer(0);
  this.socket = socket;
  if (typeof(window) === 'undefined') {
    this.socket.on('data', this.onData.bind(this));
  }
  else {
    this.socket.onmessage = this.onData.bind(this);
  }
};
util.inherits(Stream, EventEmitter);

Stream.prototype.onData = function onData(data) {
  if (typeof(window) === 'undefined') {
    this.data = ByteBuffer.concat([ this.data, data ]);
  }
  else {
    this.data = ByteBuffer.concat([ this.data, data.data ]);
  }
  
  while (this.data.limit) {
    var messageLength = this.data.readUint32(0);
    
    // Do we have received enough data ?
    if (this.data.limit < messageLength) { break; }
    
    var buffer = this.data.copy(4, messageLength);
    this.messenger.newMessageFromBuffer(buffer, function(err, message) {
      if (err) {
        return this.emit('error', err);
      }
      
      // Is this message addressed to me ?
      // Is it a broadcast ?
      if (message.destination.equals(this.address) === true
        || message.destination.equals(BROADCAST_ADDRESS) === true) {
          // Forward message to application layer
          this.emit(message.name, message);
      }
      
      // Forward message to upper layer
      this.emit('message', message);
    }.bind(this));
    
    this.data = this.data.copy(messageLength);
  }
};

Stream.prototype.send = function send() {
  var message = undefined;
  
  if (arguments.length === 1 && typeof arguments[0] === 'object' && arguments[0] instanceof Messenger.Message) {
    message = arguments[0];
  }
  else if (arguments.length === 2 && typeof arguments[0] === 'string' && typeof arguments[1] === 'object') {
    var messageName = arguments[0];
    var messageData = arguments[1];
    message = this.messenger.newMessage(messageName, messageData);
    message.source = this.address;
    
    //this.send(message);
    return Stream.prototype.send.call(this, message);
  }
  
  if (message !== undefined) {
    message.serialize(function(err, buffer) {
      if (!err) {
        // TODO: Check error
        this.socket.write(buffer);
      }
    }.bind(this));
  }
};

Stream.prototype.sendTo = function sendTo() {
  var message = undefined;
  
  if (arguments.length === 2 && typeof arguments[1] === 'object' && arguments[1] instanceof Messenger.Message) {
    var destinationAddress = arguments[0];
    message = arguments[1];
    message.destination = destinationAddress;
  }
  else if (arguments.length === 3 && typeof arguments[1] === 'string' && typeof arguments[2] === 'object') {
    var destinationAddress = arguments[0];
    var messageName = arguments[1];
    var messageData = arguments[2];
    message = this.messenger.newMessage(messageName, messageData);
    message.source = this.address;
    message.destination = destinationAddress;
  }
  
  return Stream.prototype.send.call(this, message);
  //return this.send(message);
}

Stream.prototype.on = function on(event, func) {
  EventEmitter.prototype.removeAllListeners.call(this, event);
  EventEmitter.prototype.on.call(this, event, func);
};

module.exports = Stream;