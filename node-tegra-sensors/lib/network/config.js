module.exports = {
  type: 'udp4',
  reuseAddr: true,
  udpPort: 33333,
  udpHost: null,
  tcpPort: 33334,
  multicast: '224.0.36.0',
  // multicast: '226.0.0.1',
  queryTime: 1000,
  querySecret: 'asupersecretsecret',
  queryMessage: 'is anyone there?'
}
