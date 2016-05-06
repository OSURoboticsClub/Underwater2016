/** @jsx element */
import { element } from 'deku'

import { restart, close } from '../../actions/controller'

export default {
  render ({ children, context, dispatch, path, props }) {
    const { controller } = context
    const { pending, connected, power, errors } = controller

    return (
      <pre>
        <button onClick={restart(dispatch)}>restart</button>
        <button onClick={close(dispatch)}>close</button>
        <div>listening: {String(pending)}</div>
        <div>connected: {String(connected)}</div>
        <div>power: {String(power)}</div>
        <div>errors: {String(errors)}</div>
      </pre>
    )
  }

}
