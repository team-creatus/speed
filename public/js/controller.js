var speed = angular.module('speed', ['ngRoute']);
speed.config(function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'login.html',
    controller: 'loginController'
  }).when('/game', {
    templateUrl: 'game.html',
    controller: 'gameController'
  })
});

speed.factory('socket', ['$rootScope', function($rootScope) {
 // var socket = io.connect("http://nodejs-creatus.rhcloud.com/");
  var socket = io.connect("http://localhost:3000");
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

speed.controller('loginController', ['$location', 'socket', function($location, socket) {
  this.click = function() {
    socket.emit('login', this.name);
  }

  socket.on("wait",function(){});

  socket.on("battle",function(){
  	$location.path('/game');
  });
}]);

speed.controller('gameController', ['socket', function(socket) {
  this.name = '名前なし';
  socket.on('userName', function(data) {
    this.name = data;
  });
}]);
