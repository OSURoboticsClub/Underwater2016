import {
  LISTENING,
  STREAMING,
  CONTROL,
  VECTORS
} from '../actions/motors'

const init = {
  listening: false,
  streaming: false
}

export default (state = init, { type, payload }) => {

  switch (type) {

    case LISTENING:
      state.listening = true
      return state

    case STREAMING:
      state.streaming = payload
      return state

    case CONTROL:
      state.control = payload
      return state

    case VECTORS:
      state.vectors = payload
      return state

    default:
      return state

  }

}
