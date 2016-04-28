import { combineReducers } from 'redux'

import messages from './messages'
import robots from './robots'
import gamepads from './gamepads'

export default combineReducers({
  messages,
  robots,
  gamepads
})
