const VID = [0x28de]
const PID = [0x1142]
const END = [2]
const IDX = [1]

const JSONFORMAT = {

  power: {
    events: 0,
    timecode: 0,
    state: 0 // 1 is off, 2 is on, automatically set on certain events too
  },

  idle: {
    events: 0,
    timecode: 0,
    p1: 0,
    p2: 0,
    p3: 0
  },

  data: {
    events: 0,
    timecode: 0
  },

  buttons: {
    a: false,
    b: false,
    x: false,
    y: false,
    back: false,
    next: false,
    steam: false,
    left: {
      trigger: 0,
      click: false,
      shoulder: false,
      grip: false
    },
    right: {
      trigger: 0,
      click: false,
      shoulder: false,
      grip: false
    }
  },
  pads: {
    left: {
      touch: false,
      click: false,
      stick: false,
      x: 0,
      y: 0
    },
    right: {
      touch: false,
      click: false,
      x: 0,
      y: 0
    }
  },
  gyro: {
    gyroscope: {
      pitch: 0,
      roll: 0,
      yaw: 0
    },
    orientation: {
      x: 0,
      y: 0,
      z: 0,
      w: 0
    }
  }
}

const EventEmitter = require('events')
const HID = require('node-hid')

module.exports = class SteamController extends EventEmitter {

  constructor () {
    // TODO add USB event listening and reconnect automatically
    super()
    this.device = null      // node-hid device that is producing data
    this.pending = false    // true if the device is waiting for connection
    this.controller = null  // internal for tracking state changes
  }

  close () {
    if (this.device) {
      this.device.pause()
      this.device.close()
      this.device = null
      this.controller = null
      if (this.pending) {
        this.pending = false
      } else {
        this.emit('disconnect')
      }
    }
  }

  blowItUp () {

    if (this.pending) { throw Error('already pending') }

    const configure = (err, initialBuffer) => {
      if (this.pending === false) {
        // user declined startup, abort now
        this.emit('abort')
        // debugging trace
        console.log('aborted, aborting setup')
      } else if (err) {
        this.pending = false
        // forward error event
        this.emit('error', err)
        // and clear device to indicate "disconnected" state
        this.close()
        // debugging trace
        console.error('error in async read, aborting setup')
      } else {
        this.pending = false
        // forward HID events
        this.device.on('data', this.emit.bind(this, 'data'))
        this.device.on('error', this.emit.bind(this, 'error'))
        // parse data events internally
        this.device.on('data', buffer => this.applyBuffer(buffer, Date.now()))
        // indicate successful startup
        this.emit('connect', err)
        // debugging trace
        console.log('success in async read, finished setup')
      }
    }

    this.close()
    this.pending = true
    this.device = new HID.HID(VID[0], PID[0])
    this.device.read(configure)
  }

  applyBuffer (buffer, now) {
    try {

      // I am become Asshat, King of Kludge Kode
      const old = JSON.parse(JSON.stringify(this.controller || JSONFORMAT))
      if (!this.controller) { this.controller = JSON.parse(JSON.stringify(JSONFORMAT)) }

      // check first two bytes for sanity?
      const sanity = buffer.readUInt16LE(0)
      if (sanity !== 0x0001) { throw Error(`insane: ${sanity}`) }

      // following two bytes appear to declare a command type
      const type = buffer.readUInt16LE(2)

      switch (type) {

        case 0x0b04:
          this.applyIdleBuffer(buffer)
          this.controller.power.state = 2 // because reasons
          this.triggerEvents(old)
          break

        case 0x0103:
          this.applyPowerBuffer(buffer)
          this.triggerEvents(old)
          break

        case 0x3c01:
          this.applyDataBuffer(buffer)
          this.controller.power.state = 2 // because reasons
          this.triggerEvents(old)
          break

        default:
          this.emit('error', Error('unknown buffer type'))
          console.error('unknown type', type)
          console.log('unknown buffer', buffer)

      }

    } catch (err) {

      this.emit('error', err)
      console.error('applyBuffer error', err)

    }
  }


  applyIdleBuffer (buffer) {
    const idle = this.controller.idle
    // increment event count, mostly for debugging reasons
    idle.events++
    // this assumes that the 8th byte is part of timecode
    // but I've never seen it change
    idle.timecode = buffer.readUIntLE(4, 4)
    // these are the only other three values I have seen
    // the first byte appears to drift over time
    // I have not seen the next two bytes change
    idle.p1 = buffer.readUInt8(12)
    idle.p2 = buffer.readUInt8(13)
    idle.p3 = buffer.readUInt8(14)
  }


  applyPowerBuffer (buffer) {
    const power = this.controller.power
    // increment event count, mostly for debugging reasons
    power.events++
    // 1 === turning off
    // 2 === turning on
    power.state = buffer.readInt8(4)
    // the bottom byte is being used for power state
    // so I ignore it and shift the remaining bytes
    // NOTE maybe [4] is used as unique code where [5,6,7] are the timecode
    // this assumes that the 8th byte [7] is part of timecode
    power.timecode = buffer.readUIntLE(5, 3) << 8
  }


  applyDataBuffer (buffer) {
    const data = this.controller.data
    const ctlr = this.controller
    // increment event count, mostly for debugging reasons
    data.events++
    // this assumes that the 8th byte is part of timecode
    // but I've never seen it change
    data.timecode = buffer.readUIntLE(4, 4)
    // main buttons byte
    const mb = buffer.readUInt8(8)
    ctlr.buttons.a = !!(mb & 0x80)
    ctlr.buttons.x = !!(mb & 0x40)
    ctlr.buttons.b = !!(mb & 0x20)
    ctlr.buttons.y = !!(mb & 0x10)
    ctlr.buttons.right.click = !!(mb & 0x01)
    ctlr.buttons.left.click = !!(mb & 0x02)
    ctlr.buttons.right.shoulder = !!(mb & 0x04)
    ctlr.buttons.left.shoulder = !!(mb & 0x08)
    // center buttons byte + left grip
    const cb = buffer.readUInt8(9)
    ctlr.buttons.back = !!(cb & 0x10)
    ctlr.buttons.steam = !!(cb & 0x20)
    ctlr.buttons.next = !!(cb & 0x40)
    ctlr.buttons.left.grip = !!(cb & 0x80)
    // trigger buttons byte + right grip
    const tb = buffer.readUInt8(10)
    ctlr.buttons.right.grip = !!(tb & 0x01)
    ctlr.pads.left.click = !!(tb & 0x02)
    ctlr.pads.left.touch = !!(tb & 0x08)
    ctlr.pads.left.press = !!(tb & 0x42)
    ctlr.pads.right.touch = !!(tb & 0x10)
    ctlr.pads.right.click = !!(tb & 0x04)
    // trigger analog values
    ctlr.buttons.left.trigger = buffer.readUInt8(11)
    ctlr.buttons.right.trigger = buffer.readUInt8(12)
    // pads + stick analog values
    ctlr.pads.left.x = buffer.readInt16LE(16)
    ctlr.pads.left.y = buffer.readInt16LE(18)
    ctlr.pads.right.x = buffer.readInt16LE(20)
    ctlr.pads.right.y = buffer.readInt16LE(22)
    // 0x00 x10 here
    // NOTE Hey, Valve, a great place to seperate stick values from left pad.
    // gyroscope values
    ctlr.gyro.gyroscope.pitch = buffer.readInt16LE(34) // rightward axis
    ctlr.gyro.gyroscope.roll = buffer.readInt16LE(36) // viewerward axis
    ctlr.gyro.gyroscope.yaw = buffer.readInt16LE(38) // upward axis
    // orientation quaternion
    // NOTE includes a drifting z rotation
    ctlr.gyro.orientation.w = buffer.readInt16LE(40)
    ctlr.gyro.orientation.x = buffer.readInt16LE(42)
    ctlr.gyro.orientation.y = buffer.readInt16LE(44)
    ctlr.gyro.orientation.z = buffer.readInt16LE(46)
  }


  triggerEvents (old) {
    const ctlr = this.controller
    // controller power events
    if (ctlr.power.state !== old.power.state) {
      this.emit('power', ctlr.power.state)
    }
    // TODO buttons and sheit
    // controller generic event, do last
    if (ctlr.data.timecode > old.data.timecode) {
      this.emit('control', ctlr)
    }
  }

}
