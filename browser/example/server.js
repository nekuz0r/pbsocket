var connect = require('connect');
var serveStatic = require('serve-static');

var app = connect();

app.use(serveStatic('/Users/neku/Desktop/ProjetsHexeo/gitlab/veodrive-protocol'));
app.listen(8000);
