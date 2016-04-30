'use strict'

const path = require('path')
const electron = require('electron')
const TimeoutBoolean = require('../lib/TimeoutBoolean')

const isTransmitting = new TimeoutBoolean(50)
const isRecieving = new TimeoutBoolean(50)
const isFailing = new TimeoutBoolean(50)

const windows = {
  dashboard: null
}

function openDashboard () {
  if (windows.dashboard) { windows.dashboard.focus(); return }
  const w = windows.dashboard = new electron.BrowserWindow({ frame: false, show: false })
  w.loadURL('file://' + path.join(__dirname, '../dashboard/index.html'))
  w.webContents.on('did-finish-load', () => w.show())

  function attachSafely (ee, event, func) {
    ee.on(event, func)
    w.on('closed', () => ee.off(event, func))
  }
  attachSafely(isTransmitting, 'change', (val) => w.webContents.send('isTransmitting', val))
  attachSafely(isRecieving, 'change', (val) => w.webContents.send('isRecieving', val))
  attachSafely(isFailing, 'change', (val) => w.webContents.send('isFailing', val))

  w.on('closed', () => { windows.dashboard = null })
}

const app = electron.app
app.on('ready', () => openDashboard())
app.on('activate', () => openDashboard())
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // app.quit()
  }
})

require('./tray')
const store = require('../store').configureMainStore()

const robotTimers = {}

const updateRobot = (json, remote) => {
  store.dispatch({
    type: 'APP/ROBOTS/STATUS',
    payload: {
      time: Date.now(),
      remote,
      status: json.payload
    }
  })
  const id = `${remote.address}:${remote.port}`
  if (!robotTimers[id]) {
    const tb = robotTimers[id] = new TimeoutBoolean(3500)
    tb.on('change', (value) => {
      if (!value) {
        require('node-notifier').notify({
          title: 'Lost Robot',
          message: `${id}`
        })
      }
    })
  }
  robotTimers[id].set(true)
}


const udp = require('../lib/network/udp')

udp.on('message', (json, remote) => {
  isRecieving.set(true)
  switch (json.command) {
    case 'keepalive':
      // TODO record latency
      // TODO update keepalive timer
      break
    case 'status':
      updateRobot(json, remote)
      break
    case 'controlled':
      store.dispatch({
        type: 'APP/ROBOTS/CONTROLLED',
        payload: {
          time: Date.now(),
          remote,
          values: json.payload
        }
      })
      break
    case 'error':
      isFailing.set(true)
      // console.error(json.payload)
      break

    default:
      // TODO log error
      break
  }
})


setInterval(() => {
  udp.query({ command: 'status' })
  .catch((err) => { isFailing.set(true); console.error(err) })
  .then(() => { isTransmitting.set(true) })
}, 3000)




setInterval(() => {
  const robots = store.getState().robots
  const robot = robots.list.find(r => r.id === robots.current)
  if (robot) {

    let payload = {}
    Object.keys(robot.control).forEach((k) => {
      let v = robot.control[k]
      if (v.current !== v.last) {
        payload[k] = v.current
      }
    })

    udp.send({ command: 'control', payload }, robot.remote)
    .catch((err) => { isFailing.set(true); console.error(err) })
    .then(() => { isTransmitting.set(true) })
  }
}, 100)
