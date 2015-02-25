var adler32 = require('adler32');
var uuid = require('node-uuid');
var Long, protobufjs, ByteBuffer;
if (typeof(window) === 'undefined') {
  Long = require('long');
  protobufjs = require('protobufjs');
  ByteBuffer = require('bytebuffer');
}
else {
  Long = dcodeIO.Long;
  protobufjs = dcodeIO.ProtoBuf;
  ByteBuffer = dcodeIO.ByteBuffer;
}

var BROADCAST_ADDRESS = new Long(0, 0, true);
var DEFAULT_TTL = 2;

var Messenger = function Messenger(descriptors) {
  // Make sure descriptors is an array
  descriptors = [].concat(descriptors);
  
  // Create a new protobufjs builder
  this.builder = protobufjs.newBuilder();
  
  // Load base messages descriptor
  protobufjs.loadProto("package base; \
  message Message { \
    optional uint64 src = 0; \
    optional uint64 dst = 1; \
    optional string name = 2; \
    optional bytes data = 3; \
    optional uint32 checksum = 4; \
    optional uint32 ttl = 5; \
    optional string uuid = 6; \
  } \
  message ACK { \
    optional string uuid = 1; \
  } \
  message NAK { \
    optional string uuid = 1; \
  }", this.builder);
  
  // Load the user defined messages descriptors
  for (var i = 0; i < descriptors.length; i++) {
    protobufjs.loadProtoFile(descriptors[i], this.builder);
  }
};

Messenger.prototype.newMessage = function newMessage(name, data) {
  // Validate message name
  if (this.builder.lookup(name) === null) {
    return null;
  }
  
  var message = new Message(this.builder);
  message.name = name;
  message.data = data || {};
  return message;
};

Messenger.prototype.newMessageFromBuffer = function newMessageFromBuffer(buffer, callback) {
  var message = new Message(this.builder);
  return message.parse(buffer, callback);
};

var Message = function Message(builder) {
  this.builder = builder;
  this.isContentUnserialized = false;
  
  this.name = undefined;
  this.data = {};
  this.source = BROADCAST_ADDRESS;
  this.destination = BROADCAST_ADDRESS;
  this.ttl = DEFAULT_TTL;
  this.creationTime = new Date().getTime();
  this.uuid = uuid.v1();
};

Message.prototype.serialize = function serialize(callback) {
  var messagePrototype = this.builder.build('base.Message');
  
  if (messagePrototype === null) {
    return callback(new Error('E_INTERNAL_NAME'));
  }
  
  if (this.builder.lookup(this.name)) {
    var messageDataPrototype = this.builder.build(this.name);
    
    if (messageDataPrototype === null) {
      return callback(new Error('E_NAME'));
    }
    
    var messageDataInstance = new messageDataPrototype(this.data);
    this.data = messageDataInstance.encode().toBuffer();
    this.checksum = this.calculateChecksum();
    
    this.isContentUnserialized = false;
  }
  
  var messageInstance = new messagePrototype({
    'src': this.source,
    'dst': this.destination,
    'name': this.name,
    'data': this.data,
    'checksum': this.checksum,
    'ttl': this.ttl,
    'uuid': this.uuid
  });
  var messageBuffer = messageInstance.encode();
  
  var finalBuffer = new ByteBuffer(4);
  finalBuffer.writeUint32(messageBuffer.limit + 4, 0);
  finalBuffer = ByteBuffer.concat([ finalBuffer, messageBuffer.toBuffer() ]);
  
  return callback(null, finalBuffer.toBuffer());
};

Message.prototype.parse = function parse(data, callback) {
  var messagePrototype = this.builder.build('base.Message');
  
  if (messagePrototype === null) {
    return callback(new Error('E_INTERNAL_NAME'));
  }
  
  var messageInstance = messagePrototype.decode(data.toBuffer());
  
  this.name = messageInstance.name;
  this.source = messageInstance.src;
  this.destination = messageInstance.dst;
  this.ttl = messageInstance.ttl;
  this.uuid = messageInstance.uuid;
  this.data = messageInstance.data.toBuffer();
  this.checksum = messageInstance.checksum;
  
  if (this.checksum !== this.calculateChecksum()) {
    return callback(new Error('E_CHECKSUM'));
  }
  
  // Decode the message content if we can
  // This is usefull for router, which don't know about all the message going
  // through them
  if (this.builder.lookup(this.name)) {
    var messageDataPrototype = this.builder.build(this.name);
    
    if (messageDataPrototype === null) {
      return callback(new Error('E_NAME'));
    }
    
    this.data = messageDataPrototype.decode(this.data);
    this.isContentUnserialized = true;
  }
  
  return callback(null, this);
};

Message.prototype.calculateChecksum = function calculateChecksum() {
  var buffer = this.data;
  if (typeof(window) !== 'undefined') {
    buffer = new Uint8Array(this.data);
  }
  return adler32.sum(buffer);
};

Messenger.Message = Message;

module.exports = Messenger;