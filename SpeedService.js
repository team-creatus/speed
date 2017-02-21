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
              console.log('userName:' + data.userName);
              console.log('countname:' + countname);
              console.log('countname:' + data.count);
              setInterval(function() {
                  io.emit('timer', { countdown: data.count });
              }, 1000);
            }
          }
      });

      socket.on('putcard', function(dto) {
          console.log('putcard');
          //console.log(dto);

          if (dto.username === dto.player1Name) {

            // dto.player1fieldCardList[1][0] = 10;
            // dto.daiFuda1[0] = 4;
            // カードを置いたプレイヤを1に設定
            dto.cardPosition = 1;
            dto.player1cardList.shift();
            console.log('カードを置いたプレイヤー: ' + dto.player1Name);
            logic.putMain(dto);
          } else {

            // dto.player2fieldCardList[3][0] = 24;
            // dto.daiFuda2[0] = 7;
            // カードを置いたプレイヤを2に設定
            dto.cardPosition = 2;
            dto.player2cardList.shift();
            console.log('カードを置いたプレイヤー: ' + dto.player2Name);
            logic.putMain(dto);
          }

          io.emit('showcard', dto);
      });
  });
}

module.exports = Speed;
