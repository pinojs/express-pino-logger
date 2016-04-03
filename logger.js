'use strict'

var pino = require('pino')
var eos = require('end-of-stream')
var maxInt = 2147483647
var isProduction = process.env.NODE_ENV === 'production'

function pinoLogger (stream, opts) {
  opts = opts || {}

  opts.serializers = opts.serializers || {}
  opts.serializers.req = opts.serializers.req || asReqValue
  opts.serializers.res = opts.serializers.res || pino.stdSerializers.res

  var logger = pino(opts, stream)

  loggingMiddleware.logger = logger

  var nextId = 0

  stream = logger.stream

  if (isProduction) {
    // increase speed by 20% by chunking writes
    loggingMiddleware.interval = setInterval(function () {
      if (stream.cork) {
        stream.uncork()
        stream.cork()
      }
    }, 100)
    loggingMiddleware.interval.unref()
  }

  return loggingMiddleware

  function onResFinished (err, res, startTime) {
    var end = process.hrtime(startTime)
    var log = res.log
    var responseTime = Math.round(end[0] * 1e3 + end[1] / 1e6)

    if (err) {
      log.error({
        res: res,
        err: err,
        responseTime: responseTime
      }, 'request errored')
      return
    }

    log.info({
      res: res,
      responseTime: responseTime
    }, 'request completed')
  }

  function loggingMiddleware (req, res, next) {
    var startTime = process.hrtime()
    req.id = ++nextId
    nextId = nextId % maxInt

    var child = logger.child({ req: req })

    req.log = child
    res.log = child

    eos(res, function (err) {
      onResFinished(err, res, startTime)
    })

    if (next) {
      next()
    }
  }
}

function asReqValue (req) {
  return {
    id: req.id,
    method: req.method,
    url: req.url,
    headers: req.headers,
    remoteAddress: req.connection.remoteAddress,
    remotePort: req.connection.remotePort
  }
}

module.exports = pinoLogger
