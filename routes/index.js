const path = require('path');
const csrf = require('csurf');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

// Get our Parse API routes
const parse_routes = require('./parse');

// Parsers for POST data
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

/* GET api listing. */
router.all(['/admin', '/login', '/apps', '/admin/**', '/login/**', '/apps/**'], parse_routes.parse_dashboard);
router.post('/login', parse_routes.parse_dashboard);

/* MUST BE AUTHENTICATED IN THE FUTURE!!!!!!!!! */
router.all('/parse-dashboard-config.json', (req, res, next)=> {
  // Send client config to fix admin backend errors
  res.status(200).json(parse_routes.config.dashboard);
  next();
});

// Capture all other url patterns
router.all('*', (req, res, next)=>{
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

// Start Parse Dashboard
parse_routes.Start(router); 
module.exports = router;