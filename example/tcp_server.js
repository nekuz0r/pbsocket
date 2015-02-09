var TCPServer = require('../TCPServer');

var s = new TCPServer(8000, __dirname + '/../descriptors/protocol.proto', 5678);
s.on('listening', function() {
  console.log('server: listening.');
  s.on('connect', function(client) {
    console.log('server: new client.');
    client.on('message', function(msg) {
      console.log('server:', msg.messageName);
    });
  });
});