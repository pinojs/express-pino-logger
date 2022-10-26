# express-pino-logger

This repo exists only to help people understand that [pino-http](https://github.com/pinojs/pino-http) works seamlessly with [express](http://npm.im/express). To our knowledge, `pino-http` is the [fastest express](#benchmarks) logger in town.

## Benchmarks

Benchmarks log each request/response pair while returning
`'hello world'`, using
[autocannon](https://github.com/mcollina/autocannon) with 100
connections and 10 pipelined requests (`autocannon -c 100 -p 10 http://localhost:3000`).

* `express-bunyan-logger`: 2702 req/sec
* `express-winston`: 5953 req/sec
* `morgan`: 8570 req/sec
* `pino-http`: 9807 req/sec
* `pino-http` (extreme): 10407 req/sec
* `pino-http` (without express): 22240.73 req/seq
* `pino-http` (without express and extreme): 25536 req/sec

All benchmarks where taken on a Macbook Pro 2013 (2.6GHZ i7, 16GB of RAM).

Whilst we're comparing `pino-http` against [morgan](http://npm.im/morgan), this isn't really a fair contest.

Morgan doesn't support logging arbitrary data, nor does it output JSON. Further Morgan [uses a form of `eval`](https://github.com/expressjs/morgan/blob/5da5ff1f5446e3f3ff29d29a2d6582712612bf89/index.js#L383) to achieve high speed logging. Whilst probably safe, using `eval` at all tends to cause concern, particular when it comes to server-side JavaScript.

The fact that `pino-http` achieves higher throughput with JSON logging **and** arbitrary data, without using `eval`, serves to emphasise the high-speed capabilities of `pino-http`.

With `pino-http` you can have features, safety **and** speed.
