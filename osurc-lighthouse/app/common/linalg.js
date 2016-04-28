const s = require('sylvester')
const $V = exports.$V = s.Vector.create
const $M = exports.$M = s.Matrix.create


function compileFreebody (placements) {
  const m = [[], [], [], [], [], []]
  placements.forEach(p => {
    const P = $V([p[0], p[1], p[2]])
    const F = $V([p[3], p[4], p[5]])
    const T = F.cross(P)
    m[0].push(F.e(1))
    m[1].push(F.e(2))
    m[2].push(F.e(3))
    m[3].push(T.e(1))
    m[4].push(T.e(2))
    m[5].push(T.e(3))
  })
  // 6 x m
  return $M(m)
}


// equations adapted from:
// http://people.csail.mit.edu/bkph/articles/Pseudo_Inverse.pdf
// solving regular n x n matrices
// https://www.khanacademy.org/math/precalculus/precalc-matrices/solving-equations-with-inverse-matrices/v/matrix-equations-systems

function isUnderdetermined (M) {
  const n = M.rows()
  const m = M.cols()
  return n > m
}

function isOverdetermined (M) {
  const n = M.rows()
  const m = M.cols()
  return n > m
}

function calculateUnderdeterminedPseudoInverse (M) {
  // x = (M^T M)^−1 M^T y
  return M.transpose().multiply(M).inverse().multiply(M.transpose())
}

function calculateOverdeterminedPseudoInverse (M) {
  // x = M^T (M M^T)^−1 y
  return M.transpose().multiply(M.multiply(M.transpose()).inverse())
}

// 6 x 4 ~10ms
function solve (M, y) {
  if (isUnderdetermined(M)) {
    return calculateUnderdeterminedPseudoInverse(M).multiply(y)
  } else if (isOverdetermined(M)) {
    return calculateOverdeterminedPseudoInverse(M).multiply(y)
  }
  return M.inverse().multiply(y)
}

exports.compileFreebody = compileFreebody
exports.solve = solve
