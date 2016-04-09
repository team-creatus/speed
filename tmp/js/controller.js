var speed = angular.module('speed', ['ngRoute']);
speed.config(function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'login.html',
    controller: 'loginController'
  }).when('/game', {
    templateUrl: 'game.html',
    controller: 'gameController'
  })
});

speed.factory('socket', ['$rootScope', function($rootScope) {
  var socket = io.connect("http://localhost:3000/");
  //var socket = io.connect("http://nodejs-creatus.rhcloud.com/");
  return {
    on: function(eventName, callback) {
      socket.on(eventName, callback);
      console.log(eventName);
    },
    emit: function(eventName, data) {
      socket.emit(eventName, data);
      console.log(eventName);
    }
  };
}]);

speed.controller('loginController', ['$http', '$location', 'socket', function($http, $location, socket) {
  this.click = function() {
    console.log(this.name);
    $http({
      method: 'GET',
      url: 'http://nodejs-creatus.rhcloud.com/'
      //url: 'http://localhost:3000'
    }).then(function successCallback(res) {
      console.log(res);
      $location.path('/game');
    }, function errorCallback(res) {
      console.log(res);
    });
  }
}]);

speed.controller('gameController', ['$http', '$location', 'socket', function($scope) {

}]);
