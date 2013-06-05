
var $YNCServer = require('./sync_server')

function SocketIORoom(io) {
}

function SocketIOClient(socket, io, room) {
  this.io = io
  this.socket = socket
  this.room = room
}

SocketIOClient.prototype.send = function(data) {
  this.socket.emit('message', data)
}
SocketIOClient.prototype.broadcast = function(data) {
  this.socket.in(this.room).broadcast.emit('message', data)
}

function createRoom(io, room) {
  var o = {}
  o.connection = new SocketIORoom(io)
  o.server = new $YNCServer(o.connection)
  return o
}

exports.listen = function(io) {

  var rooms = {}

  function getRoom(room) {
    return rooms[room] || (rooms[room] = createRoom(io, room))
  }
  io.on('connection', function(socket) {
    socket.on('room', function(room) {
      room = '' + room
      socket.join(room)
      var r = getRoom(room)
        , c = new SocketIOClient(socket, io.in(room), room)
      r.connection.accept(c)
      socket.on('message', function(data) {
        r.connection.recv(data, c)
      })
    })
  })

}
