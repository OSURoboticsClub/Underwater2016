import { createClient } from 'request-json'

export const REQUEST = 'cameras.request'
export const RESPONSE = 'cameras.response'
export const RESET = 'cameras.reset'
export const RESETTED = 'cameras.reset.don'

export const load = (dispatch) => (address) => {
  const url = `http://${address}:8080/`
  createClient(url)
  .get('/', (err, res, body) => {
    if (err) {
      dispatch({
        type: RESPONSE,
        payload: null
      })
    } else {
      dispatch({
        type: RESPONSE,
        payload: body
      })
    }
  })
  dispatch({
    type: REQUEST,
    payload: url
  })
}

export const reset = (dispatch) => (address) => {
  const url = `http://${address}:8080/`
  createClient(url)
  .get('/reset', (err, res, body) => {
    if (err) {
      console.error(err)
      dispatch({
        type: RESETTED,
        payload: false
      })
    } else {
      // on success, reload the list
      load(dispatch)(address)
      dispatch({
        type: RESETTED,
        payload: true
      })
    }
  })
  dispatch({
    type: RESET,
    payload: url
  })
}
