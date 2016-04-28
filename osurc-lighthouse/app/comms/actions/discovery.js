import service from '../providers/discovery'

export const LISTENING = 'discovery.listening'
export const MESSAGE = 'discovery.message'
export const PING = 'discovery.ping'
export const PONG = 'discovery.pong'

export const ping = dispatch => () => {
  const now = Date.now()
  service.query({ type: 'ping', payload: now })
  dispatch({
    type: PING,
    payload: now
  })
}

export function bind (dispatch) {

  service.on('listening', () => dispatch({ type: LISTENING }))

  service.on('json message', (remote, json) => {
    switch (json.type) {
      case 'pong':
        dispatch({
          type: PONG,
          payload: {
            address: remote.address,
            now: json.payload
          }
        })
        break
      default:
    }
  })

}
