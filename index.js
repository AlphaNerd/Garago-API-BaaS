// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');

var S3Adapter = require('parse-server-s3-adapter');
var s3Options = {
  "bucket": "garago-bucket",
  // optional:
  // "region": 'us-east-1', // default value
  // "bucketPrefix": '', // default value
  // "directAccess": false, // default value
  // "baseUrl": null // default value
  // "signatureVersion": 'v4', // default value
  // "globalCacheControl": null // default value. Or 'public, max-age=86400' for 24 hrs Cache-Control
}
var s3Adapter = new S3Adapter(s3Options);

var FSFilesAdapter = require('parse-server-fs-adapter');
var fsAdapter = new FSFilesAdapter({
    "filesSubDirectory": "./smart_library" // optional
});

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri,
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID,
  masterKey: process.env.MASTER_KEY, //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL,  // Don't forget to change to https if needed
  allowClientClassCreation: false,
  liveQuery: {
    classNames: ["ActionPlans","Messages","Projects","Organizations","Teams","Activities"] // List of classes to support for query subscriptions
  },
  // verifyUserEmails: true,
  filesAdapter: s3Adapter,
  emailAdapter: {
      module: "parse-server-amazon-ses-adapter",
      options: {
         from: "Garago <noreply@garago.net>",
         accessKeyId: "AKIAIBFVQAAG4YFG2QMA",
         secretAccessKey: "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",
         region: "ca-central-1"
      }
   }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/test', function(req, res) {
  res.status(200).send("success");
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/welcome.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
