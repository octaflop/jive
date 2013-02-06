var app = require('express')();
var server = require('http').createServer(app);
var io = require("socket.io").listen(server);
var redis = require('redis');
var db = redis.createClient();

io.configure(function () {
  io.enable('browser client etag');
  io.set('transports', [
    'websocket', 'xhr-polling'
  ]);
});

server.listen(3000);
app.enable('trust proxy');

app.use(function (req, res, next) {
  var ua = req.headers['user-agent'];
  db.zadd('online', Date.now(), ua, next);
});

app.use(function (req, res, next) {
  var min = 60 * 1000;
  var ago = Date.now() - min;
  db.zrevrangebyscore('online', '+inf', ago, function (err, users) {
    if (err) { return next(err); }
    req.online = users;
    next();
  });
});

app.get("/", function (req, res) {
  // res.send(req.online.length + ' users online');
  res.sendfile(__dirname + "/index.html");
});

io.sockets.on('connection', function (client) {

  setTimeout(function () {
    client.send("Waited 3 sec");
  }, 3000);

  client.on('message', function () {

  });

  client.on('disconnect', function () {

  });

  // socket.on('private message', function (from, msg) {
  //   console.log('Recieved PM:', from, " Saying:", msg);
  // });

  // socket.on('disconnect', function () {
  //   io.sockets.emit("User disconnected");
  // });

  // socket.emit('news', { hello: 'world' });
  // socket.on('Another event', function (data) {
  //   console.log(data);
  // });
});


console.log('listening on port 3000');