var SerialStream = require('../SerialStream');

/* SERIAL */
// Server
var s = new SerialStream('/dev/ptyp4', { baudrate: 9600 }, __dirname + '/../descriptors/protocol.proto');
s.on('connect', function() {
    console.log('connect');
    s.on('vehicle.manager.GetStatus', function(msg) {
      console.log('GetStatus');
      s.send('vehicle.client.Status', {});
      //s.close();
    });
});

// Client
var s2 = new SerialStream('/dev/ptyp5', { baudrate: 9600 }, __dirname + '/../descriptors/protocol.proto');
s2.on('connect', function() {
    console.log('connect');
    s2.on('vehicle.client.Status', function(msg) {
        console.log('Status');
        //s2.close();
    });
    
    s2.send('vehicle.manager.GetStatus', {});
});