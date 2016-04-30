/** @jsx element */
import { element } from 'deku'

export default {

  render ({ props, children, dispatch, context }) {
    return (
      <div class="loader">
        <img src="../images/1-lighthouse-animated.gif" />
        <br />
        <h2>lighthouse</h2>
        <h4>{context.messages.status}</h4>
      </div>
    )
  }

}
