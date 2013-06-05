
var connect = require('connect')
  , http = require('http')

var app = connect.createServer()
app.use(connect.static(process.cwd()))

var server = http.createServer(app)
  , io = require('socket.io').listen(server)

require('./server/socket_io_adapter').listen(io.of('/synchroscope'))

var port = parseInt(process.env.PORT, 10) || 8000
server.listen(port)
console.log('listening at port ' + port)


