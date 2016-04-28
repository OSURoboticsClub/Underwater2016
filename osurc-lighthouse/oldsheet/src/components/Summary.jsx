/** @jsx element */
import { element } from 'deku'

export default {

  render ({ props, children, dispatch, context }) {

    const { list, current } = context.robots
    const robot = list.find(r => r.id === current)

    let r = 32767

    const onThruster1 = (p1, p2) => {
      let v = p1.target.valueAsNumber
      dispatch({
        type: 'APP/ROBOTS/INPUT',
        payload: {
          thruster1: v
        }
      })
    }

    return (
      <div class="ui container">
        <h2>{robot.id}</h2>
        <h4>{robot.time}</h4>
        <h4>Controlling: {String(robot.status.isControlling)}</h4>
        <h4>Controller: {String(robot.status.controller)}</h4>
        <input max={r} min={-r} type="range" value={robot.control.thruster1.current} onInput={onThruster1} />
        <p>{String(robot.control.thruster1.current)}</p>
        <p>{String(robot.control.thruster1.last)}</p>
        <img src="http://192.168.1.136:8080/?action=stream" width="256" />
        <img src="http://192.168.1.113:8080/?action=stream" width="256" />
      </div>
    )
  }

}
