import controller from '../providers/controller'

/* eslint no-multi-spaces: 0 */
export const PENDING    = 'controller.pending'
export const ABORT      = 'controller.abort'
export const ERROR      = 'controller.error'
export const CONNECT    = 'controller.connect'
export const DISCONNECT = 'controller.disconnect'
export const POWERON    = 'controller.power.on'
export const POWEROFF   = 'controller.power.off'

export const restart = dispatch => () => {
  controller.blowItUp()
  dispatch({
    type: PENDING,
    payload: Date.now()
  })
}

// special function for fixing broken sheit
export const close = dispatch => () => controller.close()

export function bind (dispatch) {

  controller.on('abort', () => dispatch({ type: ABORT }))
  controller.on('connect', () => dispatch({ type: CONNECT }))
  controller.on('disconnect', () => dispatch({ type: DISCONNECT }))

  controller.on('power', (state) => {
    switch (state) {
      case 1:
        dispatch({ type: POWEROFF })
        break
      case 2:
        dispatch({ type: POWERON })
        break
      default:
    }
  })

}
