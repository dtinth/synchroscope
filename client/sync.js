
/*global escape, angular, unescape, io, window*/

function $YNC(connection) {
  this.connection = connection
  this.states = {}
  this.connection.recv = this.recv.bind(this)
}

;(function(proto) {

  var uid = 0
  proto.generateVersion = function() {
    return (++uid) + '.' + (new Date().getTime()) + '.' + (Math.random()) + '.' + this.clientId
  }

  proto.sendState = function(name, s) {
    this.connection.send({
      from: s.version
    , to: s.nextVersion
    , by: s.clientId
    , name: name
    , value: s.value
    })
    s.version = s.nextVersion
    s.timeout = null
    ;delete s.nextVersion
  }

  proto.set = function(name, value) {
    value = this.encode(value)
    var s = this.states[name] || (this.states[name] = { version: '-' })
    if (s.value === value) return
    var version = this.generateVersion()
    s.nextVersion = version
    s.value = value
    if (!s.timeout) {
      s.timeout = setTimeout(this.sendState.bind(this, name, s), 1000 / 30)
    }
  }

  proto.encode = function(o) {
    return escape(JSON.stringify(o))
  }
  proto.decode = function(o) {
    return JSON.parse(unescape(o))
  }

  proto.recv = function(event) {
    if (event.setClientId) {
      this.clientId = event.setClientId
    } else {
      var name = event.name
      var s = this.states[name] || (this.states[name] = { })
      s.version = event.version
      s.value = event.value
      if (event.clientId != this.clientId) {
        this.onstatechange(name, this.decode(event.value))
      }
    }
  }

})($YNC.prototype)

if (typeof angular != 'undefined') {
  angular.module('synchroscope', [])
    .factory('$ync', function($parse) {
      return function Synchroscope(scope, keys) {
        var socket = io.connect('/synchroscope')
        socket.emit('room', 'test')
        var connection = {
          send: function(data) {
            if ($YNC.debug) console.log('>>', data)
            socket.emit('message', data)
          }
        }
        socket.on('message', function(data) {
          if ($YNC.debug) console.log('<<', data)
          connection.recv(data)
        })
        var sync = new $YNC(connection)
        sync.onstatechange = function(key, value) {
          scope.$apply(function() {
            $parse(key).assign(scope, value)
          })
        }
        keys.forEach(function(key) {
          scope.$watch(key, function(value) {
            sync.set(key, value)
          })
        })
        window.sync = sync
        
      }
    })

}





