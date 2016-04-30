const linalg = require('./app/common/linalg')

/* eslint no-multiple-empty-lines: 0 */
/* eslint no-multi-spaces: 0 */
/* eslint array-bracket-spacing: 0 */

const thrusters = [
  { addr: 0x29, placement: [ -2,  0,  0,  0,  1,  0 ] },
  { addr: 0x2a, placement: [  2,  0,  0,  0, -1,  0 ] },
  { addr: 0x2b, placement: [ -2,  0,  1,  0,  0, -1 ] },
  { addr: 0x2c, placement: [  2,  0,  1,  0,  0,  1 ] }
]

const M = linalg.compileFreebody(thrusters.map(t => t.placement))

function test (name, y) {
  const x = linalg.solve(M, y)
  const Y = M.multiply(x)
  const pass = y.x(10).subtract(Y.x(10)).round().max() <= 1
  console.log('10%', name, pass)
}

test('force  x', linalg.$V([ 1, 0, 0, 0, 0, 0 ]))
test('force  y', linalg.$V([ 0, 1, 0, 0, 0, 0 ]))
test('force  z', linalg.$V([ 0, 0, 1, 0, 0, 0 ]))
test('torque x', linalg.$V([ 0, 0, 0, 1, 0, 0 ]))
test('torque y', linalg.$V([ 0, 0, 0, 0, 1, 0 ]))
test('torque z', linalg.$V([ 0, 0, 0, 0, 0, 1 ]))
