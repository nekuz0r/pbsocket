var TCPClient = require('../TCPClient.js');

var c = new TCPClient('127.0.0.1', 8000, __dirname + '/example2.proto', 1234);

c.on('connect', function() {
  c.sendTo(5678, 'Hello', { content: 'Hello' });

  c.on('World', function(msg) {
    c.sendTo(msg.source, 'Ping', {});
  });
});
