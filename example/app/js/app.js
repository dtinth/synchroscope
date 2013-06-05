'use strict';

/*global angular*/

angular.module('myApp', ['synchroscope'])
  .controller('MyController', function($scope, $ync) {

    $scope.hello = 'initial data'
    $scope.world = 'for synchroscope demo'
    $scope.foo = 'TRY IT!'

    var keys = ['hello', 'world']  // keys that you want to share
    var room = 'test'              // room name
    var sync = $ync($scope, keys, room)
    
  })
