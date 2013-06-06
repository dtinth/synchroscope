'use strict';

/*global angular,$YNC*/

angular.module('myApp', ['synchroscope'])
  .controller('MyController', function($scope, $ync) {

    $scope.hello = 'initial data'
    $scope.world = 'for synchroscope demo'
    $scope.foo = 'TRY IT!'

    var keys = ['hello', 'world']       // keys that you want to share
    var room = $scope.room || 'test'    // room name
    
    // == FOR E2E TESTING ONLY ==
    if (location.search.match(/e2etesting/)) {
      // when we are doing e2e testing, we must set the url to make it
      // use the real server, instead of karma's proxy,
      // because karma won't proxy websockets for us :(
      // we also want 100ms of latency
      room = 'http://localhost:8000/synchroscope#' + room
      $YNC.latencyTest = 100
    }

    var sync = $ync($scope, keys, room) // magic happens here
    
  })
