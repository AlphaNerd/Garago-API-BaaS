
// Example express application adding the parse-server module to expose Parse
// compatible API routes.
// rays changes
var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');
var fs = require('fs');
const resolve = require('path').resolve;

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
  publicServerURL: process.env.SERVER_URL,  // Don't forget to change to https if needed
  allowClientClassCreation: false,
  // verifyUserEmails: true,
  appName: 'GaragoAPI',
  liveQuery: {
    classNames: ["ActionPlans","Messages","Projects","Organizations","Teams","Activities"] // List of classes to support for query subscriptions
  },
  filesAdapter: s3Adapter,
  emailAdapter: {
      module: 'parse-server-mailgun',
      options: {
        // The address that your emails come from
        fromAddress: 'admin@garagosoftware.com',
        // Your domain from mailgun.com
        domain: process.env.MAILDOMAIN,
        // Your API key from mailgun.com
        apiKey: process.env.MAILGUN_KEY,
        // The template section
        templates: {
          passwordResetEmail: {
            subject: 'Reset your password',
            pathPlainText: resolve(__dirname, 'public/email_templates/password_reset_email.txt'),
            pathHtml: resolve(__dirname, 'public/email_templates/password_reset_email.html'),
            callback: (user) => { return { firstName: user.get('firstName') }}
            // Now you can use {{firstName}} in your templates
          },
          verificationEmail: {
            subject: 'Confirm your account',
            pathPlainText: resolve(__dirname, 'path/to/templates/verification_email.txt'),
            pathHtml: resolve(__dirname, 'path/to/templates/verification_email.html'),
            callback: (user) => { return { firstName: user.get('firstName') }}
            // Now you can use {{firstName}} in your templates
          },
          userInvite: {
            subject: 'You\'re invited to Garago Smart Library',
            pathPlainText: resolve(__dirname, 'public/email_templates/user_invite.txt'),
            pathHtml: resolve(__dirname, 'public/email_templates/user_invite.html')
          },
          userRegistered: {
            subject: 'New Smart Library user has registered.',
            pathPlainText: resolve(__dirname, 'public/email_templates/new_user.txt'),
            pathHtml: resolve(__dirname, 'public/email_templates/new_user.html')
          }
        }
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
// app.get('/', function(req, res) {
//   res.sendFile(path.join(__dirname, '/public/welcome.html'));
// });

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('Garago running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
