import {
  LISTENING,
  STREAMING,
  GOTVALUES
} from '../actions/arduino'

const init = {
  listening: false,
  streaming: false,
  values: {
    probe: {
      temperature: null
    },
    barometer: {
      temperature: null,
      pressure: null
    },
    error: ''
  }
}

export default (state = init, { type, payload }) => {

  switch (type) {

    case LISTENING:
      state.listening = true
      return state

    case STREAMING:
      state.streaming = payload
      return state

    case GOTVALUES:
      state.values = payload
      return state

    default:
      return state

  }

}
