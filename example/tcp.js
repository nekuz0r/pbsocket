var TCPClient = require('../TCPClient');
var TCPServer = require('../TCPServer');

/* TCP */
// Server
/*var s = new TCPServer(3000, __dirname + '/../descriptors/protocol.proto', 124325347);
s.on('listening', function() {
    console.log('server: listening.');
    s.on('connection', function(client) {
        console.log('server: new client.');
        client.on('vehicle.client.Status', function(msg) {
            console.log('Vehicle status', msg.data);
            console.log(msg.source, msg.destination);
            s.close();
        });
        client.send('vehicle.manager.GetStatus', {});
    });
});

// Client
var c = new TCPClient('127.0.0.1', 3000, __dirname + '/../descriptors/protocol.proto', 0987654);
c.on('connection', function() {
    console.log('client: connected.');
    c.on('vehicle.manager.GetStatus', function(msg) {
        console.log('Vehicle GetStatus');
        console.log(msg.source, msg.destination);
        c.sendTo(msg.source, 'vehicle.client.Status', { power: false, camera_tilt: 10, camera_pan: 0 });
        c.close();
    });
});*/

var c = new TCPClient('127.0.0.1', 8000, __dirname + '/../descriptors/protocol.proto', 1234);
c.on('connect', function() {
  console.log('C1: connected.');
  
  c.sendTo(5678, 'vehicle.manager.GetStatus', {});
  
  c.on('vehicle.client.Status', function(msg) {
    console.log('C1: Vehicle Status');
    console.log('C1:', msg.source.toString(), msg.destination.toString(), msg.ttl);
    console.log('C1:', msg.data);
    c.close();
  });
});

var c2 = new TCPClient('127.0.0.1', 8000, __dirname + '/../descriptors/protocol.proto', 5678);
c2.on('connect', function() {
  console.log('C2: connected.');
  
  c2.on('vehicle.manager.GetStatus', function(msg) {
    console.log('C2: Vehicle GetStatus');
    console.log('C2:', msg.source.toString(), msg.destination.toString(), msg.ttl);
    c2.sendTo(msg.source, 'vehicle.client.Status', { power: false, camera_tilt: 10, camera_pan: 0 });
    //c2.close();
  });
});