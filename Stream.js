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
      
      // Forward message to upper layer
      this.emit('message', message);
      
      if (message.isContentUnserialized === true) {
        // Is this message addressed to me ?
        // Is it a broadcast ?
        if (message.destination.equals(this.address) === true
          || message.destination.equals(BROADCAST_ADDRESS) === true) {
            // Forward message to application layer
            this.emit(message.name, message);
        }
      }
    }.bind(this));
    
    this.data = this.data.copy(messageLength);
  }
};

Stream.prototype.sendRaw = function sendRaw(message) {
  message.serialize(function(err, buffer) {
    if (!err) {
      // TODO: Check error
      this.socket.write(buffer);
    }
  }.bind(this));
};

Stream.prototype.send = function send(/*string*/name, /*object*/data) {
  var message = this.messenger.newMessage(name, data);
  message.source = this.address;
  Stream.prototype.sendRaw.call(this, message);
};

Stream.prototype.sendToRaw = function sendToRaw(destination, message) {
  message.destination = destination;
  Stream.prototype.sendRaw.call(this, message);
};

Stream.prototype.sendTo = function sendTo(destination, name, data) {
  var message = this.messenger.newMessage(name, data);
  message.source = this.address;
  message.destination = destination;
  Stream.prototype.sendRaw.call(this, message);
};

Stream.prototype.on = function on(event, func) {
  EventEmitter.prototype.removeAllListeners.call(this, event);
  EventEmitter.prototype.on.call(this, event, func);
};

module.exports = Stream;