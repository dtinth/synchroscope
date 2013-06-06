
/*global escape, angular, unescape, io, window, CryptoJS*/

var $YNC = (function() {

  function bind(fn, obj) {
    if (arguments.length > 2) {
      var add = Array.prototype.slice.call(arguments, 2)
      return function() {
        return fn.apply(obj, add.concat(Array.prototype.slice.call(arguments)))
      }
    }
    return function() {
      return fn.apply(obj, arguments)
    }
  }

  function $YNC(connection) {
    this.connection = connection
    this.states = {}
    this.connection.recv = bind(this.recv, this)
  }

  var proto = $YNC.prototype

  var uid = 0
  proto.rateLimit = 10

  proto.generateVersion = function(str) {
    if (typeof CryptoJS != 'undefined' && typeof CryptoJS.MD5 == 'function') {
      return CryptoJS.MD5(str).toString()
    }
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

  proto.connect = function() {
    this.connection.connect()
  }

  proto.set = function(name, value) {
    value = this.encode(value)
    var s = this.states[name] || (this.states[name] = { version: '-' })
    if (s.value === value) return
    var version = this.generateVersion(value)
    s.nextVersion = version
    s.value = value
    if (!s.timeout) {
      s.timeout = setTimeout(bind(this.sendState, this, name, s), 1000 / this.rateLimit)
    }
  }

  proto.encode = function(o) {
    if (o === undefined) return 'undefined'
    return escape(JSON.stringify(o))
  }
  proto.decode = function(o) {
    if (o === 'undefined') return undefined
    return JSON.parse(unescape(o))
  }

  proto.recv = function(event) {
    if (event.setClientId) {
      this.clientId = event.setClientId
      if (!this.ready) {
        this.ready = true
        this.onready()
      }
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

  return $YNC

})()


function $YNCSocketIOConnection(options) {
  var socket

  // to simulate network latency
  function work(fn) {
    if (!$YNC.latencyTest) return fn()
    setTimeout(fn, $YNC.latencyTest)
  }

  var connection = {
    send: function(data) {
      if ($YNC.debug) console.log('>>', data)
      work(function() {
        socket.emit('message', data)
      })
    }
  , connect: function() {
      socket = io.connect(options.server, { 'force new connection': true })
      socket.on('connect', function() {
        socket.emit('room', options.room)
      })
      socket.on('message', function(data) {
        if ($YNC.debug) console.log('<<', data)
        work(function() {
          connection.recv(data)
        })
      })
    }
  }
  return connection
}

$YNCSocketIOConnection.parseOpt = function parseOpt(str) {
  var server = '/synchroscope', room
  if (typeof str == 'string') {
    var index = str.indexOf('#')
    if (index > -1) {
      server = str.substr(0, index)
      room = str.substr(index + 1)
    } else {
      room = str
    }
  } else {
    var match = location.search.match(/channel=(\w+)/)
    if (!match) {
      window.alert('no channel specified! add ?channel=yourChannelName to URL')
      throw new Error('no channel!')
    }
    room = match[1]
  }
  return { server: server, room: room }
}

if (typeof angular != 'undefined') {
  angular.module('synchroscope', [])
    .factory('$ync', function($parse) {


      return function Synchroscope(scope, keys, connection) {

        if (typeof connection != 'object') {
          connection = new $YNCSocketIOConnection($YNCSocketIOConnection.parseOpt(connection))
        }

        var sync = new $YNC(connection)
        sync.onstatechange = function(key, value) {
          scope.$apply(function() {
            $parse(key).assign(scope, value)
          })
        }
        sync.onready = function() {
          keys.forEach(function(key) {
            scope.$watch(key, function(value) {
              sync.set(key, value)
            }, true)
          })
          scope.$apply(function() {
            scope.$ynchronized = true
          })
        }
        sync.connect()

        return sync
        
      }
    })

}





