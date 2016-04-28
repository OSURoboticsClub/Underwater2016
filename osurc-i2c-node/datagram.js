'use strict'

const dgram = require('dgram')
const EventEmitter = require('events')

class BetterDgram extends EventEmitter {

  constructor (options) {

    super()

    const opt = options || {}
    opt.type = opt.type || 'udp4'
    opt.reuseAddr = opt.reuseAddr || false

    const socket = dgram.createSocket(opt)

    socket.on('listening', this.emit.bind(this, 'listening', socket))
    socket.on('message', this.emit.bind(this, 'message'))
    socket.on('error', this.emit.bind(this, 'error'))
    socket.on('close', this.emit.bind(this, 'close'))

    this.sendJson = (r, json) => {
      const msg = new Buffer(JSON.stringify(json), 'utf8')
      return socket.send(msg, 0, msg.length, r.port, r.address)
    }

    // this.send = socket.bind.send(socket)
    this.bind = socket.bind.bind(socket)
    this.close = socket.close.bind(socket)

    this.on('message', (message, remote) => {
      try {
        const json = JSON.parse(message.toString('utf8'))
        this.emit('json message', remote, json)
      } catch (err) {/* drain */}
    })

    // NOTE binds immediately if a port is given
    if (opt.port) {
      this.bind(opt.port)
      console.log('autobind', opt.port)
    }

  }

}

class MulticastDgram extends BetterDgram {

  constructor (options) {

    if (!options) { throw Error('options required') }
    if (!options.multicast) { throw Error('multicast required') }
    if (!options.multicast.port) { throw Error('port required') }
    if (!options.multicast.group) { throw Error('group required') }

    super(options)

    const m = options.multicast
    m.ttl = m.ttl || 1 // limit to LAN
    m.loopback = m.loopback || true // localhost echo

    this.query = this.sendJson.bind(this, { port: m.port, address: m.group })

    this.on('listening', (socket) => {
      // socket.setBroadcast(true)
      socket.setMulticastTTL(m.ttl)
      socket.setMulticastLoopback(m.loopback)
      socket.addMembership(m.group)
    })

  }

}

exports.BetterDgram = BetterDgram
exports.MulticastDgram = MulticastDgram
