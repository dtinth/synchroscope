
synchroscope ($YNC) [![(Build Status)](https://travis-ci.org/dtinth/synchroscope.png?branch=master)](https://travis-ci.org/dtinth/synchroscope)
===================

__synchroscope__ makes it very easy in to share Angular.js scope variables across multiple clients.
It can be used to make a real-time interactive web application that runs on multiple devices.


Demo
----

* [Tic Tac Toe Game](http://jsfiddle.net/thai/8Gsyr/)


Client
------

synchroscope uses `Function.prototype.bind` which is unavailable in some older browsers (such as iOS5 Safari).
Please use [__es5-shim__](https://github.com/kriskowal/es5-shim) if you want to target those.

Symlink or copy `client/sync.js` to your Angular project, and include it along with `socket.io.js`.

If you include [__CryptoJS.MD5__](https://code.google.com/p/crypto-js/) on your page, synchroscope will generate
revision IDs based on the cryptographic hash of the content instead of random string,
which may help prevent editing conflicts a little bit.

```html
<script src="/socket.io/socket.io.js"></script>
<script src="path/to/md5.js"></script><!-- recommended -->
<script src="path/to/es5-shim.js"></script><!-- if you want to support few older browsers -->
<script src="path/to/sync.js"></script>
```

Then, declare a dependency on `synchroscope` module,
ask for the `$ync` service, and just call it:

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
synchronized across all browser clients who are in the same server and same room.

When the initial synchronization is made, the `$scope.$ynchronized` property will become __true__.
You can check that property to display loading screen or something.

### Specifying the Room and Server

The third argument for the $ync function can be in form of:

* `http://hostname:port/synchroscope#roomName`
    * The server and path is specified before the hash sign.
* 'roomName'
    * The server is assumed to be the same server, with path /synchroscope. This is the same as `/synchroscope#roomName`.


Server
------

Let's assume that `io` is a Socket.IO server object obtained by something like this:
`var io = require('socket.io').listen(server)`. Just add this line to your server:

```javascript
require('synchroscope').listen(io.of('/synchroscope'))
```

Limitations
-----------

* This server stores all states in-memory. This server will not scale across multiple processes.
* Each variable synchronizes on its own. If a client sets 2 variable at the same time,
  it is possible that other clients may receive one variable before another.
* When the server is restarted, funny things may happen. (clients may go out of sync)




License
-------
MIT.
