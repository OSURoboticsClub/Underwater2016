const datagram = require('../common/datagram')

const multicast = { group: '226.0.0.1', port: 33334 }
const service = new datagram.MulticastDgram({ multicast, port: 33334 })

service.on('json message', (remote, json) => {
  if (json.type === 'ping') {
    service.sendJson(remote, { type: 'pong', payload: json.payload })
  }
})
