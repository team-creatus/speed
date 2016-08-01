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
  var socket = io.connect("http://nodejs-creatus.rhcloud.com/");
  //var socket = io.connect("http://192.168.33.10:3000/");
  return {
    on: function(eventName, callback) {
      socket.on(eventName, callback);
      console.log(eventName);
    },
    emit: function(eventName, data) {
      socket.emit(eventName, data);
      console.log(eventName);
      console.log(data);
    }
  };
}]);

speed.controller('loginController', ['$location', 'socket', function($location, socket) {
  this.click = function() {
    socket.emit('login', this.name);
    $location.path('/game');
  }
}]);

speed.controller('gameController', ['socket', function(socket) {
  this.name = '名前なし';
  socket.on('userName', function(data) {
    this.name = data;
  });
}]);
