var speed = angular.module('speed', ['ngRoute']);
speed.config(function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'login.html',
    controller: 'loginController'
  }).when('/game', {
    templateUrl: 'game.html',
    controller: 'gameController'
  });
});

speed.factory('socket', ['$rootScope', function($rootScope) {
// var socket = io.connect("http://nodejs-creatus.rhcloud.com/");
 var socket = io.connect("http://localhost:8080");
  return {
	on: function (eventName, callback) {
		socket.on(eventName, function () {
			var args = arguments;
			$rootScope.$apply(function () {
				callback.apply(socket, args);
			});
		});
	},
	emit: function (eventName, data, callback) {
		socket.emit(eventName, data, function () {
			var args = arguments;
			$rootScope.$apply(function () {
				if (callback) {
					callback.apply(socket, args);
				}
			});
		});
	}
  };
}]);

var speedDto;
var userName;
var flag=false;
speed.controller('loginController', ['$location','$scope', 'socket', function($location,$scope, socket) {
  this.click = function() {
    if (!flag) {
    socket.emit("login", this.name);
	userName = this.name;
    }
  };

  socket.on("wait",function(){
   if (!flag) {
      $('#findModal').modal('show');
      flag=true;
   }
  });

  socket.on("battle",function(data){
	speedDto=data;
  $('#resutlModal').on('click', '.modal-footer .btn-primary', function () {
    $('#resutlModal').modal('hide');
    $location.path('/game');
	flag=true;
    setTimeout(function() {
      $('#login').click();
      $scope.apply();
    }, 500);
  });
    $('#findModal').modal('hide');
    $('#resutlModal').modal('show');
  });
}]);

speed.controller('gameController', ['$scope','$routeParams','socket', function($scope,$routeParams,socket) {

　//カード反映処理
  cardReflection(speedDto,$scope);

  /**
   * ドロップ時の処理
   */
  var droppableEnable = () => {
    /* revert(ドラッグされた要素をもとの位置に戻す)*/
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
          //$(".field").append("<img src=\"" + $(ui.draggable).attr("src") + "\" class=\"droped\">");

          /* ドラッグした要素を削除 */
          //$(ui.draggable).remove();

          /* ドロップが成立した場合 revertをfalseにして、元の位置に戻らないようにする。 */
          flg = false;

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
//        /* ドロップが成立しなかった場合 */
//        deactivate: function(e, ui) {
//          ui.draggable.draggable({ revert: flg });
//          /* revertをtrueにする。（ドラッグした要素を元の位置に戻す。） */
//          flg = true;
//        }
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
        revertDuration: 100,

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

	 //カード反映処理
	 cardReflection(speedDto,$scope);
  });


}]);

/*
 * カード反映処理
 */
function cardReflection(speedDto,$scope){
	//プレイヤー名設定
	  $scope.playerName = userName;
	  if(userName == speedDto.player1Name){
	  	$scope.oppName = speedDto.player2Name;
	　　　　
	　　　　//カード設定
	　　　　//残り枚数
	　　　　$scope.rest = speedDto.player1cardList.length + speedDto.player1fieldCardList.length;
	　　　　$scope.opprest = speedDto.player2cardList.length + speedDto.player2fieldCardList.length;

	　　　　//手札設定
	　　　　$scope.card1 = getCard(1,speedDto.player1fieldCardList[0][0]);
	　　　　$scope.card2 = getCard(1,speedDto.player1fieldCardList[1][0]);
	　　　　$scope.card3 = getCard(1,speedDto.player1fieldCardList[2][0]);
	　　　　$scope.card4 = getCard(1,speedDto.player1fieldCardList[3][0]);

	　　　　$scope.oppCard1 = getCard(2,speedDto.player2fieldCardList[0][0]);
	　　　　$scope.oppCard2 = getCard(2,speedDto.player2fieldCardList[1][0]);
	　　　　$scope.oppCard3 = getCard(2,speedDto.player2fieldCardList[2][0]);
	　　　　$scope.oppCard4 = getCard(2,speedDto.player2fieldCardList[3][0]);

			//場札設定
			$scope.fieldCard1 = getCard(1,speedDto.daiFuda1);
			$scope.fieldCard2 = getCard(2,speedDto.daiFuda2);
	  } else {
	  	$scope.oppName = speedDto.player1Name;

	　　　　//カード設定
	　　　　//残り枚数
	　　　　$scope.rest = speedDto.player2cardList.length + speedDto.player2fieldCardList.length;
	　　　　$scope.opprest = speedDto.player1cardList.length + speedDto.player1fieldCardList.length;

	　　　　//手札設定
	　　　　$scope.card1 = getCard(2,speedDto.player2fieldCardList[0][0]);
	　　　　$scope.card2 = getCard(2,speedDto.player2fieldCardList[1][0]);
	　　　　$scope.card3 = getCard(2,speedDto.player2fieldCardList[2][0]);
	　　　　$scope.card4 = getCard(2,speedDto.player2fieldCardList[3][0]);

	　　　　$scope.oppCard1 = getCard(1,speedDto.player1fieldCardList[0][0]);
	　　　　$scope.oppCard2 = getCard(1,speedDto.player1fieldCardList[1][0]);
	　　　　$scope.oppCard3 = getCard(1,speedDto.player1fieldCardList[2][0]);
	　　　　$scope.oppCard4 = getCard(1,speedDto.player1fieldCardList[3][0]);

			//場札設定
			$scope.fieldCard1 = getCard(2,speedDto.daiFuda2);
			$scope.fieldCard2 = getCard(1,speedDto.daiFuda1);
	  }
}

/*
*　場札のURLを取得
*/
function getCard(player,num){
　var url;
　
　if(player == 1){
　　if(num > 13){
　　　num =  zeroPadding(num - 13);
　　　url = 'img/trump/gif/c';
　　} else {
　　　url = 'img/trump/gif/s';
　　　num = zeroPadding(num);
　　}
　} else {
　　if(num > 13){
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
*　ゼロ埋め処理
*/
function zeroPadding(num){
　
　if(num < 10){
　　num = '0' + num;
　}
　
　return num;
}