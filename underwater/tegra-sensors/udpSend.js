'use strict'
const UDP = require('./lib/network/udp')
const udp = new UDP()

setInterval(() => {
  udp.send({
    address: 'tegra923',
    port: 33333
  }, {
    '0x2a': 0x7FFF
  })
}, 1000)

udp.on('message', (remote, json) => {
  console.log('got message', json)
})
