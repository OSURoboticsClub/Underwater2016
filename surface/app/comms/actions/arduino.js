import service from '../providers/arduino'

export const STREAM_START = 'arduino.streaming.start'
export const STREAM_STOP = 'arduino.streaming.start'

export const LISTENING = 'arduino.listening'
export const STREAMING = 'arduino.streaming'
export const GOTVALUES = 'arduino.values'

export const startStream = (dispatch) => (address) => {
  service.startStream(address)
  dispatch({ type: STREAM_START })
}

export const stopStream = (dispatch) => () => {
  service.stopStream()
  dispatch({ type: STREAM_STOP })
}

export function bind (dispatch) {
  service.on('listening', () => dispatch({ type: LISTENING }))
  service.on('streaming', payload => dispatch({ type: STREAMING, payload }))
  service.on('json message', ({ address, port }, { type, payload }) => {
    if (type === 'values') {
      dispatch({ type: GOTVALUES, payload })
    } else {
      console.error(Error(`unknown type ${type} from ${address}`))
    }
  })
}
