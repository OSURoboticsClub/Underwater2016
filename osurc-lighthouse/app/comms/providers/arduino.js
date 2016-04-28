import { BetterDgram } from '../../common/datagram'

const udp = new BetterDgram()

const PORT = 33335
const DELAY = 1000
let itvl

udp.startStream = (address) => {
  if (itvl) { throw Error('stream already started') }
  if (!address) { throw Error('address required') }
  clearInterval(itvl)
  const request = () => udp.sendJson({ port: PORT, address }, { type: 'values' })
  itvl = setInterval(request, DELAY)
  udp.emit('streaming', true)
}

udp.on('start stream', udp.startStream)

udp.stopStream = () => {
  if (!itvl) { throw Error('stream already stopped') }
  clearInterval(itvl)
  itvl = null
  udp.emit('streaming', false)
}

udp.on('stop stream', udp.stopStream)

export default udp
