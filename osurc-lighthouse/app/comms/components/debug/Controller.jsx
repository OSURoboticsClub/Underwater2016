/** @jsx element */
import { element } from 'deku'

import { restart, close } from '../../actions/controller'

export default {
  render ({ children, context, dispatch, path, props }) {
    const { controller } = context
    const { pending, connected, power, errors } = controller
    return (
      <div>
        <button onClick={restart(dispatch)}>restart</button>
        <button onClick={close(dispatch)}>close</button>
        <p>listening: {String(pending)}</p>
        <p>connected: {String(connected)}</p>
        <p>power: {String(power)}</p>
        <p>errors: {String(errors)}</p>
      </div>
    )
  }

}
