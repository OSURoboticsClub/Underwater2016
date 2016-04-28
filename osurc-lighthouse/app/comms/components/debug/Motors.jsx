/** @jsx element */
import { element } from 'deku'

import { startStream, stopStream } from '../../actions/motors'

import service from '../../providers/motors'
let value

export default {
  render ({ children, context, dispatch, path, props }) {
    const { motors, discovery } = context
    const { address } = discovery
    const { listening, streaming } = motors

    const onValueChange = (e) => {
      value = e.target.value
      if (address) {
        service.sendJson({ port: 33333, address }, { servos: { 0: value } })
      }
      dispatch({ type: 'nothing' })
    }

    return (
      <div>
        <button onClick={() => startStream(dispatch)(address)}>start</button>
        <button onClick={stopStream(dispatch)}>stop</button>
        <p>listening: {String(listening)}</p>
        <p>streaming: {String(streaming)}</p>
        <p>value: {String(value)}</p>
        <input max="2450" min="1600" onInput={onValueChange} type="range" value={value || 1600}/>
      </div>
    )
  }

}
