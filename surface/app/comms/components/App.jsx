/** @jsx element */
import { element } from 'deku'

import Arduino from './debug/Arduino'
import Controller from './debug/Controller'
import Discovery from './debug/Discovery'
import Motors from './debug/Motors'

import { load } from '../actions/system'

export default {
  render ({ children, context, dispatch, path, props }) {
    const address = context.discovery.address
    return (
      <div>
        <div class="values">
          <button onClick={load(dispatch)}>Load System</button>
          <Discovery/>
          <Controller/>
          <Motors/>
        </div>
        <div class="camera">
          <img height="480" src={`http://${address}:8081?action=stream`} width="640" />
        </div>
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
