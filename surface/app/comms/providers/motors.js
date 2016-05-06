
import { BetterDgram } from '../../../../common/datagram'
import { solve, compileFreebody, $V } from '../../common/linalg'


import controller from './controller'
const service = new BetterDgram()

const PORT = 33333
let endStream // exists if stream is active


service.on('stop stream', () => {

  if (!endStream) { throw Error('stream already off') }

  endStream()

  endStream = null

})


service.on('start stream', (address) => {

  if (endStream) { throw Error('stream already on') }

  let lastSent = 0
  let claw = 1600

  /* eslint no-multi-spaces: 0 */
  /* eslint array-bracket-spacing: 0 */

  const thrusters = [
    { addr: '0x29', placement: [ -1,  0,  0,  0,  1,  0 ] },
    { addr: '0x2a', placement: [  1,  0,  0,  0, -1,  0 ] },
    { addr: '0x2b', placement: [  0, -2,  0,  0,  0, -1 ] },
    { addr: '0x2c', placement: [  0,  2,  0,  0,  0, -1 ] }
  ]

  const M = compileFreebody(thrusters.map(t => t.placement))
  const Yx = M.multiply($V([ 1,  1,  1,  1]))
  const Ym = M.multiply($V([-1, -1, -1, -1]))

  const range = (yi) => {
    const size = yi.dimensions().cols
    const yf = []
    for (let i = 0; i < size; i++) {
      const n = i + 1
      const v = yi.e(n)
      yf.push(Math.abs(v) * (v >= 0 ? Yx.e(n) : Ym.e(n)))
    }
    return $V(yf)
  }

  function onControl (control) {

    if (Date.now() - lastSent >= 100) {

      lastSent = Date.now()

      service.emit('control', control)

      const bit = 15
      const ratio = v => v / (v > 0 ? (Math.pow(2, bit) - 1) : Math.pow(2, bit))

      const tz = ratio(control.pads.left.x)
      const fy = ratio(control.pads.left.y)
      const tx = ratio(control.pads.right.x)
      const fz = ratio(control.pads.right.y)

      claw -= control.buttons.left.trigger / 2
      claw += control.buttons.right.trigger / 2
      if (claw < 1600) { claw = 1600 }
      if (claw > 2300) { claw = 2300 }
      claw = Math.round(claw)

      const x = solve(M, $V([ 0, fy, fz, tx, 0, tz ]))
      // const x = solve(M, range($V([ 0, fy, fz, tx, 0, tz ])))


      const m = 0.3
      service.emit('vectors', x.x(m))

      const json = { motors: {}, servos: {} }
      thrusters.forEach((t, i) => { json.motors[t.addr] = Math.round(x.x(m).e(i + 1) * 32767) })
      json.servos['0'] = claw

      service.sendJson({ port: PORT, address }, json)
      // console.log(json.motors)
    }
  }

  function onDisconnect () {
    endStream()
    service.emit('error', Error('controller disconnected'))
  }

  function onError () {
    endStream()
    service.emit('error', Error('controller errorred'))
  }

  endStream = () => {
    controller.removeListener('control', onControl)
    controller.removeListener('disconnect', onDisconnect)
    controller.removeListener('error', onError)
    // service.removeListener('keyboard', onKeyboard)
    service.emit('streaming', false)
  }

  controller.on('error', onError)
  controller.on('disconnect', onDisconnect)
  controller.on('control', onControl)
  // service.on('keyboard', onKeyboard)
  service.emit('streaming', true)

})

export default service
