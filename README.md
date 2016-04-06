# express-pino-logger

An [express](http://npm.im/express) middleware to log with
[pino](https://github.com/mcollina/pino).

From our benchmarks, this is 4x faster than
[express-bunyan-logger](http://npm.im/express-bunyan-logger) and 25%
faster than [winston-express](http://npm.im/winston-express).
It is slightly slower (< 10%) than [morgan](http://npm.im/morgan),
which is a usecase-specific logger.

## Install

```
npm i express-pino-logger --save
```

## Example

```js
'use strict'

var app = require('express')()
var pino = require('express-pino-logger')()

app.use(pino)

app.get('/', function (req, res) {
  // each request has its own id
  // so you can track the log of each request
  // by using `req.log`
  // the ids are cycled every 2^31 - 2
  req.log.info('something else')
  res.send('hello world')
})

app.listen(3000)
```

```
$ node example.js | pino
[2016-03-31T16:53:21.079Z] INFO (46316 on MBP-di-Matteo): something else
    req: {
      "id": 1,
      "method": "GET",
      "url": "/",
      "headers": {
        "host": "localhost:3000",
        "user-agent": "curl/7.43.0",
        "accept": "*/*"
      },
      "remoteAddress": "::1",
      "remotePort": 64386
    }
[2016-03-31T16:53:21.087Z] INFO (46316 on MBP-di-Matteo): request completed
    res: {
      "statusCode": 200,
      "header": "HTTP/1.1 200 OK\r\nX-Powered-By: Express\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: 11\r\nETag: W/\"b-XrY7u+Ae7tCTyyK7j1rNww\"\r\nDate: Thu, 31 Mar 2016 16:53:21 GMT\r\nConnection: keep-alive\r\n\r\n"
    }
    responseTime: 10
    req: {
      "id": 1,
      "method": "GET",
      "url": "/",
      "headers": {
        "host": "localhost:3000",
        "user-agent": "curl/7.43.0",
        "accept": "*/*"
      },
      "remoteAddress": "::1",
      "remotePort": 64386
    }
```

## License

MIT
