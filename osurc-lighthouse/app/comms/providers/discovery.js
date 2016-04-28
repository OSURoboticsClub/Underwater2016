import { MulticastDgram } from '../../common/datagram'

const multicast = { group: '226.0.0.1', port: 33334 }
const service = new MulticastDgram({ multicast, type: 'udp4' })

export default service
