import {
  ABORT,
  CONNECT,
  DISCONNECT,
  ERROR,
  PENDING,
  POWEROFF,
  POWERON
} from '../actions/controller'

const init = {
  pending: false,
  connected: false,
  errors: 0,
  power: false
}

export default (state = init, { type, payload }) => {

  switch (type) {

    case ABORT:
      state.pending = false
      return state

    case CONNECT:
      state.pending = false
      state.connected = true
      return state

    case DISCONNECT:
      state.connected = false
      state.power = false
      return state

    case ERROR:
      state.errors++
      return state

    case PENDING:
      state.pending = true
      return state

    case POWEROFF:
      state.power = false
      return state

    case POWERON:
      state.power = true
      return state

    default:
      return state

  }

}
