import {
  LISTENING,
  STREAMING
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

    default:
      return state

  }

}
