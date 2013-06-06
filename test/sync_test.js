/*global $YNC, describe, beforeEach, afterEach, it, jasmine, expect*/
describe('$YNC', function() {

  var sync, connection
  var longEnough = 10000

  beforeEach(function() {
    connection = jasmine.createSpyObj('connection', ['send', 'connect'])
    sync = new $YNC(connection)
    sync.onstatechange = jasmine.createSpy('onstatechange')
    sync.onready = jasmine.createSpy('onready')
    jasmine.Clock.useMock()
  })

  var wait = function(time) { jasmine.Clock.tick(time); }

  describe('#connect', function() {
    it('should call connect() on connection', function() {
      sync.connect()
      expect(connection.connect).toHaveBeenCalled()
    })
  })

  describe('#onready', function() {
    it('should be called when clientId is set', function() {
      connection.recv({ setClientId: 'hello' })
      expect(sync.onready).toHaveBeenCalled()
    })
  })

  describe('#generateVersion', function() {
    it('should generate different versions with different input string', function() {
      expect(sync.generateVersion('a')).not.toEqual(sync.generateVersion('b'))
    })
    describe('when CryptoJS.MD5 is present', function() {
      var old
      beforeEach(function() {
        ;(function() {
          old = this.CryptoJS
          this.CryptoJS = {
            MD5: jasmine.createSpy('MD5').andCallFake(function(x) {
              return "md5(" + x + ")"
            })
          }
        })()
      })
      it('should generate different versions with different input string', function() {
        var old
        expect(sync.generateVersion('a')).not.toEqual(sync.generateVersion('b'))
      })
      it('should call the MD5 function', function() {
        sync.generateVersion('test')
        ;(function() {
          expect(this.CryptoJS.MD5).toHaveBeenCalledWith('test')
        })()
      })
      afterEach(function() {
        ;(function() {
          this.CryptoJS = old
        })()
      })
    })
  })

  describe('#set', function() {
    it('should send the data to the socket', function() {
      sync.set('hello', 'a')
      wait(longEnough)
      expect(connection.send).toHaveBeenCalled()
      var event = connection.send.mostRecentCall.args[0]
      expect(event.name).toEqual('hello')
      expect(event.value).toEqual(sync.encode('a'))
    })
    ;[60,30,10,5].forEach(function(rate) {
      it('should not send the data more than ' + rate + ' calls/second when rate limit is ' + rate, function() {
        sync.rateLimit = rate
        for (var i = 0; i < 100; i ++) {
          sync.set('test', i)
          wait(10)
        }
        wait(longEnough)
        expect(connection.send.callCount).not.toBeGreaterThan(rate)
      })
    })
    it('should send different data', function() {
      sync.set('test', ['a', 'b', 'c'])
      wait(longEnough)
      sync.set('test', ['a', 'b', 'd'])
      wait(longEnough)
      expect(connection.send.callCount).toEqual(2)
    })
    it('should not send the same data twice', function() {
      sync.set('test', ['a', 'b', 'c'])
      wait(longEnough)
      sync.set('test', ['a', 'b', 'c'])
      wait(longEnough)
      expect(connection.send.callCount).toEqual(1)
    })
  })

  describe('#encode and #decode', function() {
    var givens = {
      'a string': 'hello world',
      'an integer': 123,
      'an array': [1, 2, 3, 4],
      'an object': { a: 1, b: 2 },
      'an object with reversed key order': { b: 2, a: 1 },
      'null': null
    }
    Object.keys(givens).forEach(function(key) {
      var value = givens[key]
      describe('given ' + key, function() {
        it('should encode and decode to the same result', function() {
          expect(sync.decode(sync.encode(value))).toEqual(value)
        })
      })
    })
  })

  describe('#recv', function() {
    it('should set the client id', function() {
      sync.recv({ setClientId: 'HAHA' })
      expect(sync.clientId).toEqual('HAHA')
    })
    function msg(name, version, value, clientId) {
      return { name: name, version: version, value: sync.encode(value), clientId: clientId }
    }
    it('should set the state', function() {
      sync.recv(msg('test', 'a', 'b', 'c'))
      expect(sync.states.test.version).toEqual('a')
      expect(sync.decode(sync.states.test.value)).toEqual('b')
    })
    it('should set the state', function() {
      sync.recv(msg('test', 'a', 'b', 'c'))
      expect(sync.states.test.version).toEqual('a')
      expect(sync.decode(sync.states.test.value)).toEqual('b')
      sync.recv(msg('test', 'z', 'k', 'c'))
      expect(sync.states.test.version).toEqual('z')
      expect(sync.decode(sync.states.test.value)).toEqual('k')
    })
    it('should call the onstatechange handler', function() {
      sync.recv(msg('test', 'a', 'b', 'c'))
      expect(sync.onstatechange).toHaveBeenCalledWith('test', 'b')
      sync.recv(msg('test', 'z', 'k', 'c'))
      expect(sync.onstatechange).toHaveBeenCalledWith('test', 'k')
    })
    it('should ignore when data comes from oneself', function() {
      sync.recv({ setClientId: 'HAHA' })
      sync.recv(msg('test', 'c', 'b', 'HAHA'))
      expect(sync.onstatechange).not.toHaveBeenCalled()
    })
  })

})
