import {
  LISTENING,
  STREAMING
} from '../actions/motors'

const init = {
  listening: false,
  streaming: false,
  controls: {
    forwards: {},
    backwards: {},
    left: {},
    right: {},
    up: {},
    down: {}
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

    case 'controls':
      state.controls = payload
      return state

    default:
      return state

  }

}
