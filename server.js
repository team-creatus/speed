var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

http.listen(3000, function() {
  console.log('listening on *:3000');
});

io.on('connection', function(socket) {
  console.log('a user connected');

  socket.on('name', function(data) {
    console.log('test A');
    console.log(data);
  });

  socket.on('name', function(data) {
    console.log('test B');
    console.log(data);
  });

  app.get('/', function(req, res) {
    res.sendFile(__dirname + '/');
  });

  socket.on('disconnect', function() {
    console.log("disconnect");
  });

});


