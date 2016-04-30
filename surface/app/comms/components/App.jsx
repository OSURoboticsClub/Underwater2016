/** @jsx element */
import { element } from 'deku'

import Arduino from './debug/Arduino'
import Keyboard from './debug/Keyboard'
import Discovery from './debug/Discovery'
import Motors from './debug/Motors'

export default {
  render ({ children, context, dispatch, path, props }) {
    return (
      <div>
        <Discovery/>
        <Keyboard/>
        <Motors/>
        <Arduino/>
        <div class="status">
          <span class="purple" id="iloop">●</span>
          <span class="teal" id="itransmit">●</span>
          <span class="green" id="ireceive">●</span>
          <span class="yellow" id="ifailure">●</span>
        </div>
      </div>
    )
  }

}
