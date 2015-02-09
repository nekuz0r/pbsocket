var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Stream = require('./Stream');

var Server = function Server(createSocket, descriptor, address) {
  this.clients = [];
  
  var connectHandler = function connectHandler(socket) {
    var stream = new Stream(descriptor, socket, address);
    
    var clientCloseHandler = function clientCloseHandler() {
      socket.connected = false;
      var index = this.clients.indexOf(stream);
      if (index !== -1) {
        this.clients.splice(index, 1);
      }
      this.emit('disconnect', stream);
    }.bind(this);
    
    var clientErrorHandler = function clientErrorHandler(error) {
      
    }.bind(this);
    
    socket.connected = true;
    socket.on('close', clientCloseHandler);
    socket.on('error', clientErrorHandler);
    
    this.clients.push(stream);
    this.emit('connect', stream);
  }.bind(this);
  
  var listenHandler = function listenHandler() {
    this.emit('listening');
  }.bind(this);
  
  var errorHandler = function errorHandler(error) {
    
  }.bind(this);
  
  var listen = function listen() {
    this.socket = createSocket(listenHandler);
    this.socket.on('connection', connectHandler);
    this.socket.on('error', errorHandler);
    this.socket.on('listening', listenHandler);
  }.bind(this);
  
  listen();
};
util.inherits(Server, EventEmitter);

Server.prototype.broadcast = function broadcast() {
  var index;
  for (index = 0; index < this.clients.length; index++) {
    this.clients[index].send.apply(this.clients[index], arguments);
  }
};

Server.prototype.close = function close() {
  var index;
  for (index = 0; index < this.clients.length; index++) {
    this.clients[index].stream.end();
  }
  this.socket.close();
};

module.exports = Server;