/*global $YNCServer, describe, beforeEach, it, jasmine, expect*/
describe('$YNCServer', function() {

  var server, connection

  function client(name) {
    return jasmine.createSpyObj('client-' + name, ['send', 'broadcast'])
  }
  function createMockConnection() {
    return {}
  }

  beforeEach(function() {
    connection = createMockConnection()
    server = new $YNCServer(connection)
    client.a = client('a')
    client.b = client('b')
  })

  function msg(name, from, to, value, by) {
    return { name: name, from: from, to: to, value: value, by: by }
  }
  beforeEach(function() {
    server.recv(msg('test', '1', '2', 'value1', '1'), client.a)
    server.recv(msg('yeah', 'wtf', 'lol', 'value1', '3'), client.a)
  })
  it('should broadcast to other users', function() {
    expect(client.a.broadcast.callCount).toEqual(2)
  })
  it('should reject when version mismatch', function() {
    server.recv(msg('yeah', 'test', 'haha', 'value2', '2'), client.a)
    expect(client.a.send).toHaveBeenCalled()
  })
  it('should broadcast existing states', function() {
    server.accept(client.b)
    expect(client.b.send.callCount).toEqual(3)
  })

  describe('#generateClientId', function() {
    it('should generate different id each time', function() {
      expect(server.generateClientId()).not.toEqual(server.generateClientId())
    })
  })
})
