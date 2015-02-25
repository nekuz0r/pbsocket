var TCPClient = require('../TCPClient.js');

var c = new TCPClient('127.0.0.1', 8000, __dirname + '/example2.proto', 1234);
c.on('connect', function() {
  c.on('message', function(msg) {
    console.log('message', msg.name, 'from', msg.source, '(', msg.isContentUnserialized ,')')
  });

  c.sendTo(5678, 'Hello', { content: 'Hello' });

  c.on('World', function(msg) {
    c.sendTo(msg.source, 'Ping', {});
  });
});
