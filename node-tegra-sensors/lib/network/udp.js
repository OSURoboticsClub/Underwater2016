'use strict'

const dgram = require('dgram')
const bluebird = require('bluebird')
const EventEmitter = require('eventemitter2')
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
        let msg = JSON.parse(String(message))
        ee.emit('message', remote, msg)
      } catch (err) {
        ee.emit('error', err)
      }
    })

    this.socket = socket
    this.ee = ee
    this.on = ee.on.bind(ee)

  }

  bind () {
    return this.socket.bind(config.udpPort)
  }

  close () {
    return this.socket.close()
  }

  send (remote, message) {
    const msg = new Buffer(JSON.stringify(message))
    return this.socket.sendAsync(msg, 0, msg.length, remote.port, remote.address)
      .catch((err) => this.ee.emit('error', err))
  }

  query (message) {
    return exports.send({ address: config.multicast, port: config.udpPort }, message)
  }

}
