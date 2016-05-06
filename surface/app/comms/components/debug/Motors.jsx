/** @jsx element */
import { element } from 'deku'

import { startStream, stopStream } from '../../actions/motors'

import service from '../../providers/motors'
let value

export default {
  render ({ children, context, dispatch, path, props }) {
    const { motors, discovery } = context
    const { address } = discovery
    const { listening, streaming, control, vectors, servos } = motors

    const lx = control ? control.pads.left.x : null
    const ly = control ? control.pads.left.y : null
    const rx = control ? control.pads.right.x : null
    const ry = control ? control.pads.right.y : null

    const lt = control ? control.buttons.left.trigger : null
    const rt = control ? control.buttons.right.trigger : null

    const m1 = vectors ? vectors.e(1) : null
    const m2 = vectors ? vectors.e(2) : null
    const m3 = vectors ? vectors.e(3) : null
    const m4 = vectors ? vectors.e(4) : null

    return (
      <div>
        <button onClick={() => startStream(dispatch)(address)}>start</button>
        <button onClick={stopStream(dispatch)}>stop</button>
        <p>listening: {String(listening)}</p>
        <p>streaming: {String(streaming)}</p>
        <pre>
          <div>left x: <progress max="65536" value={lx + 32768}/></div>
          <div>left y: <progress max="65536" value={ly + 32768}/></div>
          <div>rght x: <progress max="65536" value={rx + 32768}/></div>
          <div>rght y: <progress max="65536" value={ry + 32768}/></div>
          <div>rght y: <progress max="255" value={lt}/></div>
          <div>rght y: <progress max="255" value={rt}/></div>
        </pre>
        <pre>
          <div>m1: {String(m1)}</div>
          <div>m2: {String(m2)}</div>
          <div>m3: {String(m3)}</div>
          <div>m4: {String(m4)}</div>
          <div>g1: {String(servos)}</div>
        </pre>
      </div>
    )
  }

}
