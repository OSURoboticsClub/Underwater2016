import service from '../providers/motors'

export const LISTENING = 'motors.listening'
export const START_STREAM = 'motors.stream.start'
export const STOP_STREAM = 'motors.stream.stop'
export const STREAMING = 'motors.streaming'
export const CONTROL = 'motors.control'
export const VECTORS = 'motors.vectors'

export const startStream = (dispatch) => (address) => {
  // TODO auto wire motor service to controller
  // TODO add events to motor service for stream
  service.emit('start stream', address)
  dispatch({ type: START_STREAM })
}

export const stopStream = (dispatch) => () => {
  service.emit('stop stream')
  dispatch({ type: STOP_STREAM })
}

export function bind (dispatch) {
  service.on('listening', () => dispatch({ type: LISTENING }))
  service.on('streaming', payload => dispatch({ type: STREAMING, payload }))
  service.on('control', payload => dispatch({ type: CONTROL, payload }))
  service.on('vectors', payload => dispatch({ type: VECTORS, payload }))
}
