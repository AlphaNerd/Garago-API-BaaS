// Load the .env file into memory
const env = require('dotenv').config().parsed || {PORT: 3000};
// Require the configuration files
var dashboard = require('./parse-dashboard.config.json');

// Set the production and localhost urls
const localhostURL = "http://localhost:" + env.PORT;
const productionURL = env.PRODUCTION_URL || localhostURL;

// Local variables
var serverURL = null;
const endpoint = '/parse';

// Determine the serverURL to use for parse
// Should support checking the NODE_ENV=production variable in the future
if (env.HOST !== 'production') serverURL = localhostURL + endpoint;
else serverURL = productionURL + endpoint;

// Set server url to dynamic port
dashboard.apps[0].serverURL = serverURL;

// console.log(["server.serverURL", server.serverURL], ["dashboard.apps[0].serverURL", dashboard.apps[0].serverURL]);

// Export dashboard applications
exports.dashboard = dashboard;