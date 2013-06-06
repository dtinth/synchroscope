#!/usr/bin/env node

var connect = require('connect')
  , http = require('http')

var app = connect.createServer()
app.use(connect.static(__dirname + '/static'))
app.use(connect.static(__dirname + '/../client'))

var server = http.createServer(app)
  , io = require('socket.io').listen(server)

require('./../index').listen(io.of('/synchroscope'))

var port = parseInt(process.env.PORT, 10) || 8000
server.listen(port)
console.log('listening at port ' + port)


