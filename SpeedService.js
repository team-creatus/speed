/**
 * スピードアプリケーション サービス
 */

var logic = require('./SpeedLogic.js');

var Speed = function(io) {

  // 待機中フラグ
  var waitPlayer = "0";

  // 一時部屋ID
  var tmpRoomId;

  // 一時ユーザ名
  var tmpName;

  // socket.io
  this.io = io;

  // カウントフラグ
  var countPlayer = "0";
  var countname = "";

  // カード更新フラグ
  var updatePlayer = "0";
  var updateName = "";
  /*
   *  socket.ioメイン処理
   */
  io.sockets.on('connection', function(socket) {
      console.log("connection");

      socket.on('disconnect', function() {
          console.log("disconnect");
      });

      socket.on('login', function(name) {
          console.log('clicked login button');
          console.log('send name:' + name);

          // 待機中プレイヤーが居る場合
          if(waitPlayer == "1"){
            console.log("battle");
            waitPlayer = "0";

            // 待機中の部屋IDにjoin
            socket.join(tmpRoomId);

            // ユーザ名リストを作成
            var nameList = new Array();

            // 待機中ユーザ名と新規ユーザ名を追加
            nameList.push(tmpName);
            nameList.push(name);

            // Dtoを生成
            var speedDto = logic.createSpeedDto(tmpRoomId,nameList);

            waitPlayer = "0";

            // 対戦処理を呼び出し
            io.to(tmpRoomId).emit('battle',speedDto);
            // 待機中プレイヤーが居ない場合
          } else {
            console.log("wait");
            // 待機プレイヤーに1を設定
            waitPlayer = "1";

            // 部屋IDを生成
            tmpRoomId = logic.createRoomId();
            socket.join(tmpRoomId);

            // ユーザ名を一時変数に追加
            tmpName = name;

            countPlayer = "0";
            countname = "";

            // 待機中処理を呼び出し
            io.to(tmpRoomId).emit('wait');
          }
      });

      socket.on('count', function(data) {
          if (countPlayer == "0" && countname == "") {
            countPlayer = "1";
          } else {
            if (countname == "") {
              countname = data.userName;
            }

            if (data.userName == countname) {
              setTimeout(function() {
                  io.emit('timer', { countdown: data.count });
              }, 1000);
              if(data.count === 0){
            	  countPlayer = "0";
            	  countname = "";
              }
            }
          }
      });


      socket.on('cardUpdate',function(data) {
    	  console.log("cardUpdate");
    	  console.log("data.userName:" + data.userName);
    	  console.log("data.count:" + data.count);
    	  console.log("updatePlayer:" + updatePlayer);
    	  console.log("updateName:" + updateName);
    	  if (updatePlayer == "0" && updateName == "") {
    		  updatePlayer = "1";
          } else {
              if (updateName == "") {
            	  updateName = data.userName;
              }
              console.log("updateName:" + updateName);
              if (data.userName == updateName) {
                if(data.count === 0){
                	updatePlayer = "0";
                	updateName = "";
                }
                setTimeout(function() {
                    io.emit('updateModal', { count: data.count });
                }, 1000);
              }
            }
      });

      socket.on('put', function(dto) {
          console.log('put');

          if (dto.username === dto.player1Name) {

            // カードを置いたプレイヤを1に設定
            dto.playerNo = 1;
            console.log('カードを置いたプレイヤー: ' + dto.player1Name);
            dto = logic.putMain(dto);
          } else {

            // カードを置いたプレイヤを2に設定
            dto.playerNo = 2;
            console.log('カードを置いたプレイヤー: ' + dto.player2Name);
            dto = logic.putMain(dto);
          }

          console.log('putend');
          console.log(dto);

          io.emit('result', dto);
      });

      socket.on('test', function(dto) {
          console.log('test');
          var len1 = dto.player1cardList.length;
          var len2 = dto.player2cardList.length;

          for (var i = 0; i < len1 / 2; i++) {
            dto.player1cardList.splice(Math.floor(Math.random() * dto.player1cardList.length), 1);
          }
          for (var i = 0; i < len2 / 2; i++) {
            dto.player2cardList.splice(Math.floor(Math.random() * dto.player2cardList.length), 1);
          }
          console.log(dto);

          io.emit('result', dto);
      });

  });
}

module.exports = Speed;
