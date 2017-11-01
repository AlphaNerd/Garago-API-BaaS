var express = require('express');
var ParseDashboard = require('parse-dashboard');

var dashboard = new ParseDashboard(require('./parse-dashboard.config.json'));

var app = express();

// make the Parse Dashboard available at /
app.use('/', dashboard);

var port = process.env.PORT || 4040;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
  console.log('parse-dashboard-example running on port ' + port + '.');
});