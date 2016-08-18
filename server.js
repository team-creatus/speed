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

// 待機中フラグ
var waitPlayer = "0";

// 部屋IDリスト
var roomIdList = [];

// 一時部屋ID
var tmpRoomId;

io.sockets.on('connection', function(socket) {
  console.log('a user connected');

  socket.on('login', function(data) {
	console.log('clicked login button');
	console.log('send data:' + data);
//	io.emit('userName', data);

	// 待機中プレイヤーが居る場合
	if(waitPlayer == "1"){
		console.log("battle");
		waitPlayer = "0";
		
		// 待機中の部屋IDにjoin
		socket.join(tmpRoomId);

		// 対戦処理を呼び出し
		io.to(tmpRoomId).emit('battle');

	// 待機中プレイヤーが居ない場合
	} else {
		console.log("wait");
		waitPlayer = "1";

		// 部屋IDを生成
		tmpRoomId = createRoomId();
		socket.join(tmpRoomId);
		
		// 待機中処理を呼び出し
		io.to(tmpRoomId).emit('wait');
	}
  });

  socket.on('disconnect', function() {
    console.log("disconnect");
  });

});

// 部屋IDをランダムに生成
function createRoomId(){
	// 乱数を生成
	var roomId = Math.floor(Math.random() * 100);
	
	// 重複しないIDが生成されるまで繰り返し
	while(roomIdList.indexOf(roomId) != -1){
		roomId = Math.floor(Math.random() * 100);
	}
	
	// 部屋IDリストに追加
	roomIdList.push(roomId);

	return roomId;
}

