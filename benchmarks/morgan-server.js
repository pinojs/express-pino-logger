'use strict'

const app = require('express')()
const http = require('http')
const server = http.createServer(app)

app.use(require('morgan')('combined'))

app.get('/', function (req, res) {
  res.send('hello world')
})

server.listen(3000)
