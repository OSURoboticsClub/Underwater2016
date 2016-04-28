'use strict'

const bluebird = require('bluebird')
require('any-promise/register')('bluebird')
const fs = require('mz/fs')
const cp = require('mz/child_process')
const rgx = /^video(\d+)$/im

let cameras = []

function scan () {
  const now = Date.now()
  return fs.readdir('/dev/')
  .then(files => files.filter(file => rgx.test(file)))
  .then((files) => {
    return files.map((file) => {
      const device = `/dev/${file}`
      const devNum = parseInt(file.match(rgx)[1], 10) // 0 from video0
      const port = 8081 + devNum
      return {
        device,
        port,
        found: now,
        started: null,
        child: null,
        error: null,
        exitCode: null
      }
    })
  })
  .then((discoveredCameras) => {
    discoveredCameras.forEach(newcam => {
      const oldcam = cameras.find(cam => cam.device === newcam.device)
      if (!oldcam) { cameras.push(newcam) }
    })
    cameras = cameras.filter(cam => cam.found === now)
  })
}

/* eslint no-console: 0 */
/* eslint no-process-env: 0 */

function start () {
  return bluebird.resolve()
  .then(() => cameras.forEach(camera => {
    console.log(camera)
    if (!camera.child || camera.error || camera.exitCode) {
      const env = process.env
      env.LD_LIBRARY_PATH = '~/Code/mjpg-streamer/mjpg-streamer-experimental/'
      const child = cp.spawn('mjpg_streamer', [
        '-i', `input_uvc.so -d ${camera.device}`,
        '-o', `output_http.so -p ${camera.port} -w ./www`
      ], {
        cwd: '/usr/local/lib/mjpg-streamer/',
        env
      })
      .on('error', (err) => {
        camera.error = err
        camera.child = null
        console.error('child error', camera.device, err)
      })
      .on('close', (code) => {
        camera.exitCode = code
        camera.child = null
        console.error('child exit', camera.device, code)
      })
      camera.started = Date.now()
      camera.child = child
      camera.error = null
      camera.exitCode = null
      console.log('started', camera.device, camera.port)
    }
  }))
}

scan()
.then(start)


const Koa = require('koa')
const Router = require('koa-router')

const app = new Koa()
const router = new Router()

router.get('/', (ctx, next) => {
  ctx.body = cameras.map(c => {
    return {
      device: c.device,
      port: c.port,
      found: c.found,
      started: c.started,
      error: c.error,
      exitCode: c.exitCode
    }
  })
})

router.get('/reset', (ctx, next) => {
  return scan()
  .then(start)
  .then(() => { ctx.status = 204 })
})

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(8080)
