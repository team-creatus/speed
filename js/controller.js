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

speed.controller('loginController', ['$http', '$location', function($http, $location) {
  this.click = function() {
    console.log(this.name);
    $http({
      method: 'GET',
      url: 'http://localhost:3000'
    }).then(function successCallback(res) {
      console.log(res);
      $location.path('/game');
    }, function errorCallback(res) {
      console.log(res);
    });
  }
}]);

speed.controller('gameController', function($scope) {

});
