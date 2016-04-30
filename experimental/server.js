'use strict'
/* eslint no-process-env: 0 */

const ASYNC = require('asyncawait/async')
const AWAIT = require('asyncawait/await')

const Koa = require('koa')
const serve = require('koa-static')

const app = new Koa()
app.use(serve('.'))
app.server = require('http').createServer(app.callback())
app.io = require('socket.io')(app.server)
app.server.listen(process.env.PORT)

app.io.on('connection', ASYNC((socket) => {
  console.log('connect', socket.id)
  AWAIT((cb) => socket.on('disconnect', cb))
  console.log('disconnect', socket.id)
}))
