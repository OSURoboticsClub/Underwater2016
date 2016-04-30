'use strict'

const bluebird = require('bluebird')
const i2c = require('i2c-bus')
const datagram = require('../common/datagram')

const Promise = bluebird

const open = (n) => {
  return new Promise((resolve, reject) => {
    const bus = i2c.open(n, (err) => {
      if (err) { reject(err) }
      else { resolve(bluebird.promisifyAll(bus)) }
    })
  })
}

const wait = (delay) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, delay)
  })
}

const setThrottle = (bus, addr, throttle) => {
  if (throttle > 0x7fff) { throw Error('max is 32767') }
  if (throttle < -0x8000) { throw Error('min is -32768') }
  // bit flippin'
  //  1 => 0x0001
  // -1 => 0x8001
  const value = throttle < 0 ? ~throttle + 0x8000 + 1 : throttle
  // to make go
  const buffer = new Buffer(2)
  buffer[0] = value >> 8 & 0xff
  buffer[1] = value & 0xff
  // send
  return bus.writeI2cBlockAsync(addr, 0x00, 2, buffer)
  .catch((err) => { throw Error(`write 0x${addr.toString(16)}`) })
}

const readSensors = (bus, addr) => {
  const buffer = new Buffer(6)
  return bus.readI2cBlockAsync(addr, 0x02, 6, buffer)
  .catch((err) => { throw Error(`read 0x${addr.toString(16)}`) })
  .then(() => {
    return {
      rev: buffer.readUInt16BE(0),
      volt: buffer.readUInt16BE(2),
      temp: buffer.readUInt16BE(4)
    }
  })
}

const initializeESC = (bus, addr) => {
  return wait(3000)
  .then(() => setThrottle(bus, addr, -0x7fff)) // 0xffff
  .then(() => setThrottle(bus, addr, 0x0000))
}


const udp = new datagram.BetterDgram({ port: 33333 })
const motors = [0x29, 0x2a, 0x2b, 0x2c]
const times = [], throttles = {}, sensors = {}, drifting = {}
let bus

function exit (code) {
  return Promise.resolve()
  .then(() => udp.close())
  .then(() => motors.map(addr => setThrottle(bus, addr, 0))).all()
  .catch((err) => process.exit(1))
  .then(() => process.exit(code))
}

open(1)
.then(bus1 => { bus = bus1 })
.then(() => motors.map(addr => initializeESC(bus, addr))).all()
.then(() => bus.writeByteAsync(0x40, 0x00, 0x10))
.then(() => bus.writeByteAsync(0x40, 0xfe, 0x79))
.then(() => bus.writeByteAsync(0x40, 0x00, 0x00))
.then(() => {

  throttles[0x29] = 0
  throttles[0x2a] = 0
  throttles[0x2b] = 0
  throttles[0x2c] = 0

  drifting[0x29] = 0
  drifting[0x2a] = 0
  drifting[0x2b] = 0
  drifting[0x2c] = 0

  function loop () {
    const started = Date.now()
    Promise.resolve()
    .then(() => motors.map(addr => {

      const drift = 500

      if (Math.abs(throttles[addr] - drifting[addr]) > drift) {
        if (throttles[addr] - drifting[addr] > drift) {
          drifting[addr] += drift
        } else {
          drifting[addr] -= drift
        }
      } else {
        drifting[addr] = throttles[addr]
      }

      return setThrottle(bus, addr, drifting[addr])

    })).all()
    .then(() => motors.map(addr => {
      readSensors(bus, addr)
      .then(values => { sensors[addr] = values })
    })).all()
    .then(() => {
      const time = Date.now() - started
      times.push(time)
      if (times.length > 5) { times.shift() }
    })
    .then(() => setTimeout(loop, 50))
  }

  // start infinite loop
  loop()

})


udp.on('json message', (remote, json) => {

  if (json.motors) {
    Object.keys(json.motors).forEach(key => {
      const addr = parseInt(key, 16)
      const throttle = parseInt(json.motors[key], 10)
      if (typeof throttles[addr] === 'number') {
        throttles[addr] = throttle
      } else {
        throw Error(`bad address 0x${addr.toString(16)}`)
      }
    })
  }

  if (json.servos) {
    Object.keys(json.servos).map(key => {
      // calculate address start
      const index = parseInt(key, 10)
      if (index < 0) { throw Error('index negative') }
      if (index > 7) { throw Error('index not wired') }
      const addr = index * 4 + 0x06
      // calculate pulse width
      const width = parseInt(json.servos[key], 10)
      if (width < 0) { throw Error('width negative') }
      if (width >= 20000) { throw Error('width is capped at 20000ns') }
      const value = Math.round((Math.pow(2, 12) - 1) * (width / 20000))
      // finally, send
      return Promise.resolve()
      .then(() => bus.writeByteAsync(0x40, addr + 0, 0))
      .then(() => bus.writeByteAsync(0x40, addr + 1, 0))
      .then(() => bus.writeByteAsync(0x40, addr + 2, value & 0xff))
      .then(() => bus.writeByteAsync(0x40, addr + 3, value >> 8 & 0x0f))
    })
  }

})

process.on('SIGINT', () => exit())
