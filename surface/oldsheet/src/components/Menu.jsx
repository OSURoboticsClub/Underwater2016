/** @jsx element */
import { element } from 'deku'

export default {

  render ({ props, children, dispatch, context }) {

    const { list, current } = context.robots
    const robot = list.find(r => r.id === current)

    return (
      <nav class="ui top fixed menu frame-grip">
        <div class="item">
          <span class="teal" id="transmitIndicator">●</span>
          <span class="green" id="receiveIndicator">●</span>
          <span class="orange" id="failureIndicator">●</span>
        </div>
        <div class="item">
          <select disabled={true} multiple={false}>
            <option value="disconnected">disconnected</option>
            {list.map(r => <option selected={r.id === current} value={r.id}>{r.id}</option>)}
          </select>
        </div>
        <a class="item right" href="#" onClick={window.close}>Close</a>
      </nav>
    )
  }

}
