'use strict'

const test = require('tap').test
const http = require('http')
const express = require('express')
const pinoLogger = require('./')
const split = require('split2')

function setup (t, middleware, cb) {
  const app = express()
  const server = http.createServer(app)
  app.use(middleware)
  server.listen(0, '127.0.0.1', function (err) {
    cb(err, server)
  })
  app.get('/', function (req, res) {
    res.end('hello world')
  })
  t.teardown(function (cb) {
    server.close(cb)
  })

  return app
}

function doGet (server) {
  const address = server.address()
  http.get('http://' + address.address + ':' + address.port)
}

test('default settings', function (t) {
  const dest = split(JSON.parse)
  const logger = pinoLogger(dest)

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

  const dest = split(JSON.parse)
  const logger = pinoLogger(dest)

  dest.on('data', function (line) {
    t.equal(line.msg, 'hello world')
  })

  logger.logger.info('hello world')
})

test('allocate a unique id to every request', function (t) {
  t.plan(5)

  const dest = split(JSON.parse)
  const logger = pinoLogger(dest)
  let lastId = null

  setup(t, logger, function (err, server) {
    t.error(err)
    doGet(server)
    doGet(server)
  })

  dest.on('data', function (line) {
    t.not(line.req.id, lastId)
    lastId = line.req.id
    t.ok(line.req.id, 'req.id is defined')
  })
})

test('supports errors in the response', function (t) {
  const dest = split(JSON.parse)
  const logger = pinoLogger(dest)

  const app = setup(t, logger, function (err, server) {
    t.error(err)
    const address = server.address()
    http.get('http://' + address.address + ':' + address.port + '/error')
  })

  app.get('/error', function (req, res) {
    res.emit('error', new Error('boom!'))
    res.end()
  })

  dest.on('data', function (line) {
    t.ok(line.req, 'req is defined')
    t.ok(line.res, 'res is defined')
    t.ok(line.err, 'err is defined')
    t.equal(line.msg, 'request errored', 'message is set')
    t.equal(line.req.method, 'GET', 'method is get')
    t.equal(line.res.statusCode, 200, 'statusCode is 200')
    t.end()
  })
})

test('supports errors in the middleware', function (t) {
  const dest = split(JSON.parse)
  const logger = pinoLogger(dest)

  const app = setup(t, logger, function (err, server) {
    t.error(err)
    const address = server.address()
    http.get('http://' + address.address + ':' + address.port + '/error')
  })

  app.get('/error', function (req, res, next) {
    next(new Error('boom!'))
  })

  app.use(function (err, req, res, next) {
    res.status(500).send({ err: err })
  })

  dest.on('data', function (line) {
    t.ok(line.req, 'req is defined')
    t.ok(line.res, 'res is defined')
    t.ok(line.err, 'err is defined')
    t.equal(line.msg, 'request errored', 'message is set')
    t.equal(line.req.method, 'GET', 'method is get')
    t.equal(line.res.statusCode, 500, 'statusCode is 500')
    t.end()
  })
})

test('no express', function (t) {
  const dest = split(JSON.parse)
  const logger = pinoLogger(dest)

  const server = http.createServer(handle)
  function handle (req, res) {
    logger(req, res)
    res.end('hello world')
  }

  t.teardown(function (cb) {
    server.close(cb)
  })

  server.listen(0, '127.0.0.1', function (err) {
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

test('responseTime', function (t) {
  const dest = split(JSON.parse)
  const logger = pinoLogger(dest)

  const server = http.createServer(handle)
  function handle (req, res) {
    logger(req, res)
    setTimeout(function () {
      res.end('hello world')
    }, 100)
  }

  t.teardown(function (cb) {
    server.close(cb)
  })

  server.listen(0, '127.0.0.1', function (err) {
    t.error(err)
    doGet(server)
  })

  dest.on('data', function (line) {
    // let's take into account Node v0.10 is less precise
    t.ok(line.responseTime >= 90, 'responseTime is defined and in ms')
    t.end()
  })
})
