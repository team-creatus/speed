/** モジュール定義 */
var speed = angular.module('speed', ['ngRoute']);

/** configはアプリケーションの開始前に実行される */
speed.config(function($routeProvider) {
    // ルーティングの設定
    $routeProvider.when('/', {
        templateUrl: 'login.html'
    }).when('/game', {
        templateUrl: 'game.html'
    });
});

/** socket.io 接続設定 */
speed.factory('socket', ['$rootScope', function($rootScope) {
      // var socket = io.connect("http://nodejs-creatus.rhcloud.com/");
      var socket = io.connect("http://localhost:8080");
      return {
        on: function (eventName, callback) {
          socket.on(eventName, function() {
              var args = arguments;
              $rootScope.$apply(function() {
                  callback.apply(socket, args);
              });
          });
        },
        emit: function (eventName, data, callback) {
          socket.emit(eventName, data, function() {
              var args = arguments;
              $rootScope.$apply(function() {
                  if (callback) {
                    callback.apply(socket, args);
                  }
              });
          });
        }
      };
}]);

/** スピードDTO */
var speedDto;
/** ユーザ名 */
var userName;
/** 入力チェックフラグ */
var flag;
/** ログイン画面コントローラ */
speed.controller('loginController', ['$location','$scope', 'socket', function($location, $scope, socket) {

	// ログインボタンの押下イベント
	this.click = function() {
		userName = this.name;
		if(userName ===  null ||typeof userName === "undefined" || userName === "" ){
			$('#noNameModal').modal("show");
		}else{
			socket.emit("login", this.name);
		}
	};

      // サーバから「wait」が通知された場合
      socket.on("wait", function(){
          // 待機中のダイアログを表示
          $('#findModal').modal('show');
      });
      // サーバから「battle」が通知された場合
      socket.on("battle", function(data){
          speedDto = data;
          // 対戦開始のダイアログを表示
          $('#findModal').modal('hide');
          $('#resutlModal').modal('show');
          // 対戦開始ダイアログでOKが押下された場合
          $('#resutlModal').on('click', '.modal-footer .btn-primary', function () {
              // 対戦開始ダイアログを閉じる
              $('#resutlModal').modal('hide');
              // ゲーム画面に遷移
              // Bootstrapのモーダルウインドウが閉じる前に画面遷移すると
              // モーダル状態が解除されないため、少し遅延してから実行する
              setTimeout(function() {
                  $location.path('/game');
                  // 対戦開始ダイアログのクリックイベントはAngularJSのライフサイクル外のため、
                  // applyでAngularJSに画面遷移を通知する
                  $scope.$apply();
              }, 500);
          });
      });
}]);

var timerFlag = true;
var countFlag1=true;
var countFlag2=true;
var countFlag3=true;
var start=true;
speed.controller('gameController', ['$scope','$routeParams','socket','$interval', function($scope,$routeParams,socket) {

	// カウントダウン処理
	if (timerFlag) {
		timerFlag=false;
		$scope.countdown = "wait";
		$('.alert').modal('show');
		socket.emit("count", {userName:userName, count:3});
	}

	socket.on("timer", function(data) {
		if (data.countdown <= 0) {
			if (start) {
				start = false;
				$scope.countdown = "Start!"
				$('.alert').fadeIn(0).delay(800).fadeOut(200);
			}
		} else {
			if (countFlag3 && data.countdown==3) {
				$('.alert').modal('hide');
				countFlag3=false;
				$scope.countdown = "3";
				$('.alert').fadeIn(0).delay(800).fadeOut(200);
				socket.emit("count", {userName:userName, count:2});
			} else if (countFlag2 && data.countdown==2) {
				countFlag2=false;
				$scope.countdown = "2";
				$('.alert').fadeIn(0).delay(800).fadeOut(200);
				socket.emit("count", {userName:userName, count:1});
			} else if (countFlag1 && data.countdown==1) {
				countFlag1=false;
				$scope.countdown = "1";
				$('.alert').fadeIn(0).delay(800).fadeOut(200);
				socket.emit("count", {userName:userName, count:0});
			}
		}
	});

      // カード反映処理
      cardReflection(speedDto,$scope);

      /**
       * ドロップ時の処理
       */
      var droppableEnable = () => {
        /* revert(ドラッグされた要素をもとの位置に戻す) */
        var flg = true;
        $(".dropArea").droppable({
            /* 要素が完全にドロップ領域に入らないと受け入れない */
            tolerance: "fit",
            /* ドロップ時に実行 */
            drop: function(e, ui) {
              /* ドラッグ要素のクラス(手札の位置)を取得 */
              var clazz = ui.draggable.attr("id");

              /* ドロップされた位置を取得 */
              var droppableNum = e.target.id;

              /* ドラッグされたカード、ドロップされたエリアを取得 */
              var draggedCard;
              var droppableArea;
              if(userName == speedDto.player1Name){
                /* ドラッグ要素のidからカードを特定 */
                if("card-1" == clazz){
                  draggedCard = speedDto.player1fieldCardList[0][0];
                } else if("card-2" == clazz){
                  draggedCard = speedDto.player1fieldCardList[1][0];
                } else if("card-3" == clazz){
                  draggedCard = speedDto.player1fieldCardList[2][0];
                } else if("card-4" == clazz){
                  draggedCard = speedDto.player1fieldCardList[3][0];
                }
                /* 台札の位置を特定（プレイヤー2の場合は台札1,2を逆転） */
                if("area1" == droppableNum){
                  droppableArea = "1";
                } else {
                  droppableArea = "2";
                }
              } else {
                /* ドラッグ要素のidからカードを特定 */
                if("card-1" == clazz){
                  draggedCard = speedDto.player2fieldCardList[0][0];
                } else if("card-2" == clazz){
                  draggedCard = speedDto.player2fieldCardList[1][0];
                } else if("card-3" == clazz){
                  draggedCard = speedDto.player2fieldCardList[2][0];
                } else if("card-4" == clazz){
                  draggedCard = speedDto.player2fieldCardList[3][0];
                }

                /* 台札の位置を特定（プレイヤー2の場合は台札1,2を逆転） */
                if("area1" == droppableNum){
                  droppableArea = "2";
                } else {
                  droppableArea = "1";
                }
              }

              /* 場札の子要素を削除(古いカードを削除) */
              // $(".field").empty();

              /* 場札をドラッグしたカード画像に書き換える. */
              // $(".field").append("<img src=\"" +
              // $(ui.draggable).attr("src") + "\" class=\"droped\">");

              /* ドラッグした要素を削除 */
              // $(ui.draggable).remove();

              //	            /* ドロップが成立した場合 revertをfalseにして、元の位置に戻らないようにする。 */
              //	            flg = false;

              /* ユーザー名 */
              speedDto.username = userName;
              /* 重ね札 */
              speedDto.submitCard = draggedCard;
              /* 重ね位置 */
              speedDto.cardPosition = droppableArea;

              socket.emit("put", speedDto);

              /* 追加した要素(新しく手札に追加したカードにdraggableを適用 */
              draggableEnable();

              ui.draggable.draggable({ revert: flg });
            },
            // /* ドロップが成立しなかった場合 */
            // deactivate: function(e, ui) {
            // ui.draggable.draggable({ revert: flg });
            // /* revertをtrueにする。（ドラッグした要素を元の位置に戻す。） */
            // flg = true;
            // }
        });
      }

      /**
       * .cardを持つ要素にdraggableを適用させる。
       */
      var draggableEnable = () => {
        $(".playerCard").draggable({
            /* ドラッグしている要素を最前面にする。 */
            stack: ".card",

            /* ドロップ領域にスナップさせる。 */
            snap: ".dropArea",
            /* 内側にスナップ */
            snapMode: "inner",
            /* スナップする領域の範囲 値が大きいほど遠い位置からスナップする. */
            snapTolerance: 40,
            /* ドロップ可能領域ではない場合、元の位置に戻る */
            revert: true,
            /* 元の位置に戻る速度 ミリ秒 */
            revertDuration: 0,
            /* ドラッグ中に実行する */
            drag: function() {},
        });
          }

          /**
           * 初期処理
           */
          (function() {
              /* 生成した要素にdraggableを適用 */
              draggableEnable();
              /* ドロップ領域を使用可能にする。 */
              droppableEnable();
          })();

          socket.on('userName', function(data) {
              this.name = data;
          });

          socket.on('result',function(data){
              speedDto = data;

              // 台札更新判定
              if(speedDto.checkGameResult != null && !speedDto.checkGameResult){
            	  // ダイアログを表示
            	  $scope.countdown = "カードを置けません";
            	  $('.alert').modal('show');
          		  socket.emit("cardUpdate", {userName:userName, count:1});

          		  var modalFlg1 = true;
          		  var modalFlg0 = true;

          		  socket.on("updateModal",function(data) {
          			  if(modalFlg1 && data.count === 1){
          				  $('.alert').modal('hide');
          				  modalFlg1 = false;
          				  $scope.countdown = "カードを配ります";
          				  $('.alert').fadeIn(0).delay(800).fadeOut(200);
          				  socket.emit("cardUpdate",{userName:userName, count:0});
          			  } else if(modalFlg0 && data.count <= 0){
          				  modalFlg0 = false;
          				 $scope.countdown = "Readey?";
          				 $('.alert').fadeIn(0).delay(800).fadeOut(200);
          			  }
          		  });
              }
              // カード反映処理
              cardReflection(speedDto,$scope)
          });
    }]);

speed.controller('testController', ['$location','$scope', 'socket', function($location, $scope, socket) {
  console.log('click test');
  this.test = function() {
    socket.emit('test', speedDto);
  }

}]);

    /*
     * カード反映処理
     */
    function cardReflection(speedDto,$scope){
      // プレイヤー名設定
      $scope.playerName = userName;
      if(userName == speedDto.player1Name) {
        $scope.oppName = speedDto.player2Name;

        // メッセージ設定
        $scope.message = speedDto.player1Message;

        // カード枚数
        var ownFieldCard = 0;
        var oppFieldCard = 0;
        // カード設定
        // 残り枚数
        for (var i = 0; i < speedDto.player1fieldCardList.length; i++) {
          if (speedDto.player1fieldCardList[i][0] !== 0) {
            ownFieldCard++;
          }
        }

        for (var i = 0; i < speedDto.player2fieldCardList.length; i++) {
          if (speedDto.player2fieldCardList[i][0] !== 0) {
            oppFieldCard++;
          }
        }

        $scope.rest = speedDto.player1cardList.length + ownFieldCard;
        $scope.opprest = speedDto.player2cardList.length + oppFieldCard;

        // 手札設定
        $scope.card1 = getCard(1,speedDto.player1fieldCardList[0][0]);
        $scope.card2 = getCard(1,speedDto.player1fieldCardList[1][0]);
        $scope.card3 = getCard(1,speedDto.player1fieldCardList[2][0]);
        $scope.card4 = getCard(1,speedDto.player1fieldCardList[3][0]);

        $scope.oppCard1 = getCard(2,speedDto.player2fieldCardList[0][0]);
        $scope.oppCard2 = getCard(2,speedDto.player2fieldCardList[1][0]);
        $scope.oppCard3 = getCard(2,speedDto.player2fieldCardList[2][0]);
        $scope.oppCard4 = getCard(2,speedDto.player2fieldCardList[3][0]);

        // 場札設定
        $scope.fieldCard1 = getCard(speedDto.daiFuda1[0], speedDto.daiFuda1[1]);
        $scope.fieldCard2 = getCard(speedDto.daiFuda2[0], speedDto.daiFuda2[1]);
      } else {
        $scope.oppName = speedDto.player1Name;

        // メッセージ設定
        $scope.message = speedDto.player2Message;

        // カード枚数
        var ownFieldCard = 0;
        var oppFieldCard = 0;
        for (var i = 0; i < speedDto.player1fieldCardList.length; i++) {
          if (speedDto.player2fieldCardList[i][0] !== 0) {
            ownFieldCard++;
          }
        }

        for (var i = 0; i < speedDto.player2fieldCardList.length; i++) {
          if (speedDto.player1fieldCardList[i][0] !== 0) {
            oppFieldCard++;
          }
        }

        // カード設定
        // 残り枚数
        $scope.rest = speedDto.player2cardList.length + ownFieldCard;
        $scope.opprest = speedDto.player1cardList.length + oppFieldCard;

        // 手札設定
        $scope.card1 = getCard(2,speedDto.player2fieldCardList[0][0]);
        $scope.card2 = getCard(2,speedDto.player2fieldCardList[1][0]);
        $scope.card3 = getCard(2,speedDto.player2fieldCardList[2][0]);
        $scope.card4 = getCard(2,speedDto.player2fieldCardList[3][0]);

        $scope.oppCard1 = getCard(1,speedDto.player1fieldCardList[0][0]);
        $scope.oppCard2 = getCard(1,speedDto.player1fieldCardList[1][0]);
        $scope.oppCard3 = getCard(1,speedDto.player1fieldCardList[2][0]);
        $scope.oppCard4 = getCard(1,speedDto.player1fieldCardList[3][0]);
        // 場札設定
        $scope.fieldCard1 = getCard(speedDto.daiFuda2[0], speedDto.daiFuda2[1]);
        $scope.fieldCard2 = getCard(speedDto.daiFuda1[0], speedDto.daiFuda1[1]);
      }
      if((speedDto.player1Message == "あなたの勝ち") || (speedDto.player1Message == "あなたの負け")){
	      if(userName == speedDto.player1Name) {
	    	  if(speedDto.player1Message == "あなたの勝ち"){
	    		  $('#winnerModal').modal("show");
	    	  }else{
	    		  $('#loserModal').modal("show");
	    	  }
	      }else{
	    	  if(speedDto.player2Message == "あなたの勝ち"){
	    		  $('#winnerModal').modal("show");
	    	  }else{
	    		  $('#loserModal').modal("show");
	    	  }
	      }
      }else if((speedDto.player1Message == "引き分け")){
    	  $('#drawModal').modal("show");
      }
      // 勝敗判定
      if(speedDto.player1ResultCode == "2" || speedDto.player2ResultCode == "2"){
        var result = confirm($scope.message);

        // TODO 未実装
        // 再戦
        if(result){

          // 終了
        } else {

        }
      }

      // メッセージエリアデフォルト値設定
//      if($scope.message == "") {
//        $scope.message = "メッセージエリア";
//      }
    }

    /*
     * 場札のURLを取得
     */
    function getCard(player,num){
      var url;

      if (num === 0) {
        return 'img/trump/empty.gif';
      }

      if(player == 1) {
        if(num > 13) {
          num =  zeroPadding(num - 13);
          url = 'img/trump/gif/c';
        } else {
          url = 'img/trump/gif/s';
          num = zeroPadding(num);
        }

      } else {
        if(num > 13) {
          num = zeroPadding(num - 13);
          url = 'img/trump/gif/d';
        } else {
          num = zeroPadding(num);
          url = 'img/trump/gif/h';
        }
      }

      card = url + num + '.gif';

      return card;

    }

    /*
     * ゼロ埋め処理
     */
    function zeroPadding(num){

      if(num < 10){
        num = '0' + num;
      }
      return num;
    }
