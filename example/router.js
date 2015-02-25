var Router = require('../Router.js');
var TCPServer = require('../TCPServer.js');

var router = new Router();

var iface = new TCPServer(8000);

router.addInterface(iface);