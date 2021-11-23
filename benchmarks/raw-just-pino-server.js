'use strict'

const http = require('http')
const server = http.createServer(handle)

const pino = require('pino')({
  extreme: true
})

function handle (req, res) {
  pino.info(req)
  res.end('hello world')
}

server.listen(3000)
