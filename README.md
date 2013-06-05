
synchroscope ($YNC) : Realtime Angular.js scope syncing with Socket.IO
===================

For interactive web applications that are to be run on multiple devices at the same time,
__synchroscope__ makes it very easy to share scope variables.

~~~javascript
angular.module('myApp', ['synchroscope'])
  .controller('MyController', function($scope, $ync) {

    $scope.hello = 'initial data'
    $scope.world = 'for synchroscope demo'
    $scope.foo = 'TRY IT!'

    var keys = ['hello', 'world']  // keys that you want to share
    var room = 'test'              // room name
    var sync = $ync($scope, keys, room)
    
  })
~~~

As soon as you call `$ync`, the keys `hello` and `world` will be
synchronized across all browser clients.
