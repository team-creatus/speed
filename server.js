var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

http.listen(3000, function() {
  console.log('listening on *:3000');
});

// expressでstaticファイル(*.css, *.js, *.html)を公開するために
// 必要なstaticミドルウェア
app.use(express.static('public'));
app.use(express.static('views'));

// /にアクセスした場合、index.htmlにリダイレクト
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
  console.log('a user connected');

  socket.on('login', function(data) {
    console.log('clicked login button');
    console.log('send data:' + data);
    io.emit('userName', data);
  });

  socket.on('disconnect', function() {
    console.log("disconnect");
  });

});


