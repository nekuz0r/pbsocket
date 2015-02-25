var uuid = require('node-uuid');
var Long = require('long');

var BROADCAST_ADDRESS = new Long(0, 0, true);

var Router = function Router() {
  this.routingTable = {};
  this.ifaces = [];
};

Router.prototype.addInterface = function addInterface(iface) {
  iface.on('connect', function(socket) {
    socket.uuid = uuid.v1();
    console.log('add iface', socket.uuid);
    this.ifaces.push(socket);
    
    socket.on('message', function(message) {
      if (message.ttl <= 0) { return; }
      
      console.log('incoming message from', message.source.toString(), 'to', message.destination.toString(), '@', socket.uuid, '(' , message.ttl, ')');
      
      // Learning route
      if (Array.isArray(this.routingTable[message.source]) === false) {
        this.routingTable[message.source] = [];
      }
      
      if (message.source !== 0) {
        if (this.routingTable[message.source].indexOf(socket) === -1) {
          console.log('add route to', message.source.toString(), '@', socket.uuid);
          this.routingTable[message.source].push(socket);
        }
      }
      
      this.forward(message, socket);
    }.bind(this));
  }.bind(this));
  
  iface.on('disconnect', function(socket) {
    // Remove all routes using this socket
    for (var addr in this.routingTable) {
      if (this.routingTable.hasOwnProperty(addr)) {
        for (var i = 0; i < this.routingTable[addr].length; i++) {
          if (this.routingTable[addr][i] === socket) {
            this.routingTable[addr].splice(i, 1);
            console.log('remove route to', addr, '@', socket.uuid);
          }
        }
      }
    }
    
    // Remove the iface
    var ifaceIndex = this.ifaces.indexOf(socket);
    if (ifaceIndex !== -1) {
      this.ifaces.splice(ifaceIndex, 1);
      console.log('remove iface', socket.uuid);
    }
  }.bind(this));
};

Router.prototype.addRoute = function addRoute(addr, iface) {
  this.routingTable[addr] = iface;
};

Router.prototype.removeRoute = function removeRoute(addr) {
  delete this.routingTable[addr];
};

Router.prototype.forward = function forward(message, sourceSocket) {
  message.ttl = message.ttl - 1;
  
  if (message.destination.equals(BROADCAST_ADDRESS) === true) {
    return this.broadcast(message, sourceSocket);
  }
  
  var dstIfaces = this.routingTable[message.destination];
  if (Array.isArray(dstIfaces) === false || dstIfaces.length === 0) {
    return this.broadcast(message, sourceSocket);
  }
  
  for (var i = 0; i < dstIfaces.length; i++) {
    if (dstIfaces[i] !== sourceSocket) {
      console.log('forwarding message from', message.source.toString(), 'to', message.destination.toString(), '@', dstIfaces[i].uuid);
      dstIfaces[i].sendRaw(message);
    }
  }
};

Router.prototype.broadcast = function broadcast(message, sourceSocket) {
  var dstIface;
  for (var i = 0; i < this.ifaces.length; i++) {
    dstIface = this.ifaces[i];
    if (dstIface != sourceSocket) {
      console.log('forwarding message from', message.source.toString(), 'to', message.destination.toString(), '@', dstIface.uuid, '(broadcast)');
      dstIface.sendRaw(message);
    }
  }
};

module.exports = Router;

/*
var TCPServer = require('./TCPServer');

var r = new Router();
var s = new TCPServer(8000, './descriptors/protocol.proto');

r.addInterface(s);
*/