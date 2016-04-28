'use strict'

const dgram = require('dgram')
const EventEmitter = require('events')
const bluebird = require('bluebird')
const config = require('./config')

module.exports = class UDP {

  constructor () {
    const ee = new EventEmitter()
    const socket = bluebird.promisifyAll(dgram.createSocket(config))

    socket.on('listening', () => {
      socket.setBroadcast(true)
      socket.setMulticastTTL(1)
      socket.setMulticastLoopback(true)
      socket.addMembership(config.multicast, config.udpHost)
      ee.emit('listening')
    })

    socket.on('message', (message, remote) => {
      try {
        let msg = JSON.parse(`${message}`)
        ee.emit('message', remote, msg)
      } catch (err) {
        ee.emit('error', err)
      }
    })

    this.socket = socket
    this.ee = ee
    this.on = ee.on.bind(ee)
    this.lastMessage = 0
    this.lastError = 0
    this.lastSend = 0

    ee.on('error', () => { this.lastError = Date.now() })
    ee.on('message', () => { this.lastMessage = Date.now() })
  }

  bind () {
    return this.socket.bind(config.udpPort)
  }

  close () {
    return this.socket.close()
  }

  send (remote, json) {
    const msg = new Buffer(JSON.stringify(json))
    return this.socket.sendAsync(msg, 0, msg.length, remote.port, remote.address)
      .then(() => { this.lastSend = Date.now() })
      .catch((err) => this.ee.emit('error', err))
  }

  query (json) {
    return this.send({ address: config.multicast, port: config.udpPort }, json)
  }

}
