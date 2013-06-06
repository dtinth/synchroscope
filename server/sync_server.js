

var $YNCServer = (function() {

  function bind(fn, obj) {
    return function() {
      return fn.apply(obj, arguments)
    }
  }

  function $YNCServer(connection) {
    this.connection = connection
    this.states = {}
    this.connection.recv = bind(this.recv, this)
    this.connection.accept = bind(this.accept, this)
  }

  var proto = $YNCServer.prototype

  proto.recv = function(event, client) {
    var name = event.name
    var s = this.states[name]
    if (s && s.value == event.value) return
    if (s && s.version != event.from) {
      client.send({ name: name, version: s.version, value: s.value, clientId: s.lastOwner })
      return
    }
    client.broadcast({ name: name, version: event.to, value: event.value, clientId: event.clientId })
    if (!s) s = this.states[name] = {}
    s.version = event.to
    s.value = event.value
    s.lastOwner = event.clientId
  }

  var uid = 0, init = new Date().getTime() + '.' + Math.random()

  proto.generateClientId = function() {
    return init + ':' + (++uid)
  }

  proto.accept = function(client) {
    var that = this
    Object.keys(this.states).forEach(function(name) {
      var s = that.states[name]
      client.send({ name: name, version: s.version, value: s.value, clientId: '-' })
    })
    client.send({ setClientId: this.generateClientId() })
  }

  return $YNCServer

})()

if (typeof module != 'undefined') module.exports = $YNCServer

