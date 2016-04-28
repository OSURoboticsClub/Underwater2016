import {
  REQUEST,
  RESPONSE
} from '../actions/pm2'

const init = {
  loading: false,
  json: null
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

    default:
      return state

  }

}
