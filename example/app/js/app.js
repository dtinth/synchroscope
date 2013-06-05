'use strict';

/*global angular*/

// Declare app level module which depends on filters, and services
angular.module('myApp', ['synchroscope'])
  .controller('MyController', function($scope, $ync) {

    $scope.hello = 'initial data'
    $scope.world = 'for synchroscope demo'
    
    $ync($scope, ['hello', 'world'])
    
  })
