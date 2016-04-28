/** @jsx element */
import { element } from 'deku'

import { startStream, stopStream } from '../../actions/arduino'

export default {
  render ({ children, context, dispatch, path, props }) {
    const { arduino, discovery } = context
    const { address } = discovery
    const { listening, streaming, values } = arduino
    return (
      <div>
        <button onClick={() => startStream(dispatch)(address)}>start stream</button>
        <button onClick={stopStream(dispatch)}>stop stream</button>
        <p>listening: {String(listening)}</p>
        <p>streaming: {String(streaming)}</p>
        <p>error: {values.error}</p>
        <p>probe temp: {values.probe.temperature}</p>
        <p>baro temp: {values.barometer.temperature}</p>
        <p>baro pres: {values.barometer.pressure}</p>
      </div>
    )
  }

}
