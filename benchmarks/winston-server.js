'use strict'

const app = require('express')()
const http = require('http')
const winston = require('winston')
const winstonExpress = require('express-winston')
const server = http.createServer(app)

app.use(winstonExpress.logger({
  transports: [
    new winston.transports.Console({
      json: true
    })
  ]
}))

app.get('/', function (req, res) {
  res.send('hello world')
})

server.listen(3000)
