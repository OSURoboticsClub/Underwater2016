import { createClient } from 'request-json'

export const REQUEST = 'pm2.request'
export const RESPONSE = 'pm2.response'

export const load = (dispatch) => (address) => {
  const url = `http://${address}:9615/`
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
