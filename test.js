'use strict'

var test = require('tap').test
var http = require('http')
var express = require('express')
var pinoLogger = require('./')
var split = require('split2')

function setup (t, middleware, cb) {
  var app = express()
  var server = http.createServer(app)
  app.use(middleware)
  server.listen(0, '127.0.0.1', function (err) {
    cb(err, server)
  })
  app.get('/', function (req, res) {
    res.end('hello world')
  })
  t.tearDown(function (cb) {
    server.close(cb)
  })

  return app
}

function doGet (server) {
  var address = server.address()
  http.get('http://' + address.address + ':' + address.port)
}

test('default settings', function (t) {
  var dest = split(JSON.parse)
  var logger = pinoLogger(dest)

  setup(t, logger, function (err, server) {
    t.error(err)
    doGet(server)
  })

  dest.on('data', function (line) {
    t.ok(line.req, 'req is defined')
    t.ok(line.res, 'res is defined')
    t.equal(line.msg, 'request completed', 'message is set')
    t.equal(line.req.method, 'GET', 'method is get')
    t.equal(line.res.statusCode, 200, 'statusCode is 200')
    t.end()
  })
})

test('exposes the internal pino', function (t) {
  t.plan(1)

  var dest = split(JSON.parse)
  var logger = pinoLogger(dest)

  dest.on('data', function (line) {
    t.equal(line.msg, 'hello world')
  })

  logger.logger.info('hello world')
})

test('allocate a unique id to every request', function (t) {
  t.plan(5)

  var dest = split(JSON.parse)
  var logger = pinoLogger(dest)
  var lastId = null

  setup(t, logger, function (err, server) {
    t.error(err)
    doGet(server)
    doGet(server)
  })

  dest.on('data', function (line) {
    t.notEqual(line.req.id, lastId)
    lastId = line.req.id
    t.ok(line.req.id, 'req.id is defined')
  })
})

// test('supports errors', function (t) {
//   var dest = split(JSON.parse)
//   var logger = pinoLogger(dest)
//
//   var app = setup(t, logger, function (err, server) {
//     t.error(err)
//     var address = server.address()
//     http.get('http://' + address.address + ':' + address.port + '/error')
//   })
//
//   app.get('/error', function (req, res) {
//     res.emit('error', new Error('boom!'))
//   })
//
//   dest.on('data', function (line) {
//     t.ok(line.req, 'req is defined')
//     t.ok(line.res, 'res is defined')
//     t.equal(line.msg, 'request completed', 'message is set')
//     t.equal(line.req.method, 'GET', 'method is get')
//     t.equal(line.res.statusCode, 500, 'statusCode is 500')
//     t.end()
//   })
// })
