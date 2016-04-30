
import { BetterDgram } from '../../../../common/datagram'
import { solve, compileFreebody, $V } from '../../common/linalg'

// import controller from './controller'
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

  /* eslint no-multi-spaces: 0 */
  /* eslint array-bracket-spacing: 0 */

  const thrusters = [
    { addr: 0x29, placement: [ -1,  0,  0,  0,  1,  0 ] },
    { addr: 0x2a, placement: [  1,  0,  0,  0, -1,  0 ] },
    { addr: 0x2b, placement: [  2,  0,  0,  0,  0, -1 ] },
    { addr: 0x2c, placement: [ -2,  0,  0,  0,  0, -1 ] }
  ]

  const M = compileFreebody(thrusters.map(t => t.placement))

  function onKeyboard (controls) {

    const max = Math.pow(2, 15) - 1

    let fy = 0
    if (controls.forwards.pressed) { fy += max }
    if (controls.backwards.pressed) { fy -= max }
    let tz = 0
    if (controls.right.pressed) { tz += max }
    if (controls.left.pressed) { tz -= max }
    let fz = 0
    if (controls.up.pressed) { fz += max }
    if (controls.down.pressed) { fz -= max }

    const x = solve(M, $V([ 0, fy, fz, 0, 0, tz ])).x(0.1)

    console.log(x)

    const json = {
      motors: {
        // port forwards
        '0x29': x.e(1),
        // starboard forward
        '0x2a': x.e(2),
        // starboard upwards
        '0x2b': x.e(3),
        // port upwards
        '0x2c': x.e(4)
      }
    }

    service.sendJson({ port: PORT, address }, json)

  }











  function onControl (control) {
    if (Date.now() - lastSent >= 500) {
      lastSent = Date.now()
      const fy = control.pads.left.y
      const tz = control.pads.right.x
      const fz = control.pads.right.y
      const x = solve(M, $V([ 0, fy, fz, 0, 0, tz ])).x(0.1)

      console.log(x.e(1), x.e(2), x.e(3), x.e(4))

      const json = {
        motors: {
          // port forwards
          '0x29': 0,
          // starboard forward
          '0x2a': 0,
          // starboard upwards
          '0x2b': 0,
          // port upwards
          '0x2c': 0
        }
      }
      service.sendJson({ port: PORT, address }, json)
      //console.log('sent', address, PORT, json.motors)
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
    // controller.removeListener('control', onControl)
    // controller.removeListener('disconnect', onDisconnect)
    // controller.removeListener('error', onError)
    service.removeListener('keyboard', onKeyboard)
    service.emit('streaming', false)
  }

  // controller.on('error', onError)
  // controller.on('disconnect', onDisconnect)
  // controller.on('control', onControl)
  service.on('keyboard', onKeyboard)
  service.emit('streaming', true)

})

export default service
