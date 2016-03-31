'use strict'

var app = require('express')()
var pino = require('./')()

app.use(pino)

app.get('/', function (req, res) {
  req.log.info('something else')
  res.send('hello world')
})

app.listen(3000)
