import {
  REQUEST,
  RESPONSE,
  RESET,
  RESETTED
} from '../actions/cameras'

const init = {
  loading: false,
  json: null,
  resetting: false,
  reset: false
}

export default (state = init, { type, payload }) => {

  switch (type) {

    case REQUEST:
      state.loading = true
      return state

    case RESPONSE:
      state.loading = false
      state.json = payload
      return state

    case RESET:
      state.resetting = true
      state.reset = false
      state.json = null
      return state

    case RESETTED:
      state.resetting = false
      state.reset = payload
      return state

    default:
      return state

  }

}
