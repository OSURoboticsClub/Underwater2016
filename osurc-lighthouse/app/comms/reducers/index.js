import { combineReducers } from 'redux'

import arduino from './arduino'
import cameras from './cameras'
import controller from './controller'
import discovery from './discovery'
import motors from './motors'
import pm2 from './pm2'

export default combineReducers({
  arduino,
  cameras,
  controller,
  discovery,
  motors,
  pm2
})
