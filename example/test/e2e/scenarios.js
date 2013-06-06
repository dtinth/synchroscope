'use strict';
/*global describe, beforeEach, it, element, input, using, expect, browser, sleep*/

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('synchroscope + example app', function() {

  var aBit = 0.3
  
  beforeEach(function() {
    browser().navigateTo('/example/app/index.html?e2etesting')
    sleep(aBit * 2)
  })

  it('should initialize with the same data', function() {
    element('#test1 .hello').query(function(text1, done) {
      expect(element('#test2 .hello').val()).toEqual(text1.val())
      done()
    })
  })

  function enter(id, name, value, delay) {
    using(id).input(name).enter(value)
    if (delay) sleep(delay)
  }
  function expectVal(id, name, value) {
    if (typeof id == 'object') {
      return id.forEach(function(id) { expectVal(id, name, value) })
    }
    expect(using(id).input(name).val()).toEqual(value)
  }
  function expectSync(id, name, value) {
    enter(id, name, value, aBit)
    expectVal(['#test1', '#test2'], name, value)
  }

  it('should synchronize data between 2 clients', function() {
    expectSync('#test1', 'hello', 'abc')
    expectSync('#test1', 'hello', 'def')
    expectSync('#test2', 'hello', 'ghi')
    expectSync('#test2', 'hello', 'jkl')
  })

  it('should synchronize multiple writes', function() {
    for (var i = 0; i < 100; i ++) {
      enter('#test2', 'hello', 'test' + i, 0.01)
    }
    sleep(aBit)
    expectVal(['#test1', '#test2'], 'hello', 'test99')
  })

  it('should not write to other room', function() {
    enter('#test1', 'world', 'this', aBit)
    enter('#test3', 'world', 'that', aBit)
    expectVal('#test2', 'world', 'this')
    expectVal('#test3', 'world', 'that')
  })

  it('should sync on a first-come first-serve basis', function() {
    enter('#test1', 'hello', 'a', aBit)
    expectVal('#test2', 'hello', 'a')
    enter('#test1', 'hello', 'b', 0.05)
    enter('#test2', 'hello', 'c', aBit)
    expectVal(['#test1', '#test2'], 'hello', 'b')
  })

})
