const ARDUINO_DEV = '/dev/ttyACM0'
const ARDUINO_UDP = { type: 'udp4', port: 33335 }

const serialport = require('serialport')
const datagram = require('../common/datagram')

const values = {
  probe: {
    temperature: null
  },
  barometer: {
    temperature: null,
    pressure: null
  },
  error: 'initializing...'
}

// binds immediately
const udp = new datagram.BetterDgram(ARDUINO_UDP)

udp.on('json message', (remote, json) => {
  if (json.type === 'values') {
    udp.sendJson(remote, { type: 'values', payload: values })
  }
})

udp.on('error', err => console.error(err))

// opens immediately
const port = new serialport.SerialPort(ARDUINO_DEV, {
  baudrate: 9600,
  parser: serialport.parsers.readline('\n')
})

port.on('error', err => { values.error = err })

port.on('data', data => {
  try {
    const matches = data.match(/C: ([\d\.]+)/i)
    values.probe.temperature = parseFloat(matches[1], 10)
  } catch (err) {
    port.emit('error', err)
  }
})
