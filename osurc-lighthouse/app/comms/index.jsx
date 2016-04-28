/** @jsx element */
import { element, createApp } from 'deku'
import configureStore from './store/configureStore'
import App from './components/App'
import { bind as bindArduino } from './actions/arduino'
import { bind as bindController } from './actions/controller'
import { bind as bindDiscovery } from './actions/discovery'
import { bind as bindMotors } from './actions/motors'

const store = configureStore()
bindArduino(store.dispatch)
bindController(store.dispatch)
bindDiscovery(store.dispatch)
bindMotors(store.dispatch)

const main = document.getElementsByTagName('main')[0]
const tree = createApp(main, store.dispatch)

store.subscribe(() => tree(<App/>, store.getState()))
store.dispatch({ type: 'app.init' })
