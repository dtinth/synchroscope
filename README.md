
synchroscope ($YNC)
===================

For interactive web applications that are to be run on multiple devices at the same time,
__synchroscope__ makes it very easy to share scope variables.

Client
------

```javascript
angular.module('myApp', ['synchroscope'])
  .controller('MyController', function($scope, $ync) {

    $scope.hello = 'initial data'
    $scope.world = 'for synchroscope demo'
    $scope.foo = 'TRY IT!'

    var keys = ['hello', 'world']  // keys that you want to share
    var room = 'test'              // room name
    var sync = $ync($scope, keys, room)
    
  })
```

As soon as you call `$ync`, the keys `hello` and `world` will be
synchronized across all browser clients.


Server
------

Let's assume that `io` is a Socket.IO server object obtained by something like this:
`var io = require('socket.io').listen(server)`. Just add this line to your server:

```javascript
require('synchroscope').listen(io.of('/synchroscope'))
```
