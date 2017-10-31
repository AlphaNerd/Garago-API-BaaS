// Declare globals
const parse_config = require('./parse.config.js');

const ParseDashboard = require('parse-dashboard');
// const LiveQuery = require('./parse-live-query.js')

// Declare api endpoint routing middleware
const dashboard = new ParseDashboard(parse_config.dashboard);

// Export Functions
exports.config = parse_config;
exports.dashboard = dashboard;

/* 
	Define Express App's to export 
*/

// Express dependencies
const express = require('express');
const bodyParser = require('body-parser');

// Express parse_dashboard export
const parse_dashboard = express();
parse_dashboard.use(bodyParser.json());
parse_dashboard.use(bodyParser.urlencoded({ extended: false }));
// Routing strategy
parse_dashboard.use(dashboard);
exports.parse_dashboard = parse_dashboard;

// Start the Parse server & dashboard components
exports.Start = (ExpressServer)=>{
	// Declare Port vars
	let dp = parse_config.dashboard.port;
	
	// Begin Listeners
	parse_dashboard.listen(dp, () => console.log(`Parse Dashboard running on localhost:${dp}`));
};