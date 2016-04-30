import { combineReducers } from 'redux'

import arduino from './arduino'
import cameras from './cameras'
import keyboard from './keyboard'
import discovery from './discovery'
import motors from './motors'
import pm2 from './pm2'

export default combineReducers({
  arduino,
  cameras,
  keyboard,
  discovery,
  motors,
  pm2
})
