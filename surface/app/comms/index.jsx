/** @jsx element */
import { element, createApp } from 'deku'
import configureStore from './store/configureStore'
import App from './components/App'
import { bind as bindArduino } from './actions/arduino'
import { bind as bindDiscovery } from './actions/discovery'
import { bind as bindMotors } from './actions/motors'

const store = configureStore()
bindArduino(store.dispatch)
bindDiscovery(store.dispatch)
bindMotors(store.dispatch)

const main = document.getElementsByTagName('main')[0]
const tree = createApp(main, store.dispatch)

store.subscribe(() => tree(<App/>, store.getState()))
store.dispatch({ type: 'app.init' })


const controls = {
  forwards: {
    pressed: false,
    which: 87
  },
  backwards: {
    pressed: false,
    which: 83
  },
  left: {
    pressed: false,
    which: 65
  },
  right: {
    pressed: false,
    which: 68
  },
  up: {
    pressed: false,
    which: 69
  },
  down: {
    pressed: false,
    which: 81
  }
}

import motors from './providers/motors'

document.addEventListener('keydown', e => {
  let change = false
  Object.values(controls).forEach(c => {
    if (c.which === e.which) {
      c.pressed = true
      if (!c.pressedOld) { change = true }
      c.pressedOld = true
    }
  })
  if (change) {
    store.dispatch({ type: 'controls', payload: controls })
    motors.emit('keyboard', controls)
  }
})

document.addEventListener('keyup', e => {
  let change = false
  Object.values(controls).forEach(c => {
    if (c.which === e.which) {
      c.pressed = false
      if (c.pressedOld) { change = true }
      c.pressedOld = false
    }
  })
  if (change) {
    store.dispatch({ type: 'controls', payload: controls })
    motors.emit('keyboard', controls)
  }
})
