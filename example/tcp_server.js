var TCPServer = require('../TCPServer');

var s = new TCPServer(8000, __dirname + '/example.proto', 5678);
s.on('listening', function() {
  s.on('connect', function(client) {
    client.on('message', function(msg) {
      console.log('message', msg.name, 'from', msg.source, '(', msg.isContentUnserialized ,')')
    });
    
    client.on('Hello', function(msg) {
      client.sendTo(msg.source, 'World', { content: 'World' });
    });
  });
});
