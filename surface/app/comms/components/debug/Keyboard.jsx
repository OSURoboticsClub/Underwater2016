/** @jsx element */
import { element } from 'deku'

export default {
  render ({ children, context, dispatch, path, props }) {
    const c = context.keyboard.controls
    return (
      <div>
        <pre>forward   : {String(c.forwards.pressed)}</pre>
        <pre>backwards : {String(c.backwards.pressed)}</pre>
        <pre>left      : {String(c.left.pressed)}</pre>
        <pre>right     : {String(c.right.pressed)}</pre>
        <pre>down      : {String(c.down.pressed)}</pre>
        <pre>up        : {String(c.up.pressed)}</pre>
      </div>
    )
  }
}
