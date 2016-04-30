import {
  LISTENING,
  PING,
  PONG
} from '../actions/discovery'

const init = {
  listening: false,
  address: '',
  now: ''
}

export default (state = init, { type, payload }) => {

  switch (type) {

    case LISTENING:
      state.listening = true
      return state

    case PING:
      state.address = ''
      state.now = ''
      return state

    case PONG:
      state.address = payload.address
      state.now = payload.now
      return state

    default:
      return state

  }

}
