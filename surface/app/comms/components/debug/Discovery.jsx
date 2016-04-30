/** @jsx element */
import { element } from 'deku'
import moment from 'moment'

import { ping } from '../../actions/discovery'

export default {
  render ({ children, context, dispatch, path, props }) {
    const { discovery } = context
    const { address, listening, now } = discovery
    const nowFrom = now ? moment(now).fromNow() : ''
    return (
      <div>
        <button onClick={ping(dispatch)}>ping</button>
        <p>listening: {String(listening)}</p>
        <p>address: {address}</p>
        <p>now: {nowFrom}</p>
      </div>
    )
  }

}
