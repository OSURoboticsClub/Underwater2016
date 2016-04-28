/** @jsx element */
import { element } from 'deku'
import Menu from './Menu'
import Loader from './Loader'
import Summary from './Summary'

export default {

  render ({ props, children, dispatch, context }) {

    const { list, current } = context.robots
    const robot = list.find(r => r.id === current)

    return (
      <div>
        <Menu/>
        {(robot)
          ? <Summary/>
          : <Loader/>
        }

      </div>

    )
  }

}
