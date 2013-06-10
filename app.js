/**
 * Instagram real-time stream example using WebSockets and AngularJS.
 *
 * It may be (or rather seriously is) in need of some refactoring, tests and documentation.
 * However it still showcases the simplicity and power of AngularJS (and node.js) as intended.
 *
 * Oh and thanks to the guys behind the instagram-node-lib API wrapper, you saved me a lot of time.
 *
 * example by John Granström
 */

var express = require('express'),
  insta = require('./lib/insta');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

/**
 * We'll just initialize the entire web server here, yeah I like that
 */

// Set to running host without http:// and trailing / with optional port (e.g. 'ingular-8003.onmodulus.net[:port]')
// Prefer setting environment variable prior to hard coding here
// Note that localhost wont be very good (as useless as peter pan) as a callback url for the instagram API subscriptions
app.set('appHost', process.env.APP_HOST || 'localhost');
console.log('Using host location:', app.get('appHost'));

app.set('views', './views');
app.set('view engine', 'jade');

app.use(express.logger());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static('./app/'));
app.use(function(err, req, res, next) {
  console.log('err');
  console.log(err);
});

app.get('/', function(req, res) {
  res.render('index', {
    appHost: app.get('appHost') // Provide the host address to the client for socket.io connection
  });
});

/**
 * insta is an abstraction library I made for the real-time capabilities of the instagram API
 * built on top of the instagram-node-lib. Initialize it here to set up callbacks and such
 */
insta.init(io, app);

/**
 * This is all we need to set up socket.io with the insta lib
 */
io.sockets.on('connection', function(socket) {
  socket.on('addTag', function(tag) {
    insta.addClientToTag(socket, tag);
  });

  socket.on('removeTag', function(tag) {
    insta.removeClientFromTag(socket, tag);
  });

  socket.on('disconnect', function() {
    insta.removeClient(socket);
  });
});

// Make sure we start with a clean slate of subscriptions
insta.unsubscribeAll();

server.listen(process.env.PORT || 80);