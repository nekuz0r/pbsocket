var WSClient = require('../WSClient');
var WSServer = require('../WSServer');

/* WebSocket */
// Server
var s = new WSServer(3000, __dirname + '/../descriptors/protocol.proto');
s.on('listening', function() {
    console.log('listening');
    s.on('connect', function(client) {
        console.log('new client');
        client.on('vehicle.client.Status', function(msg) {
            console.log('Vehicle status', msg.data);
            s.close();
        });
        client.send('vehicle.manager.GetStatus', {});
    });
});