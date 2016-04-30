/** @jsx element */
import { element, createApp } from 'deku'
import { configureStore } from './store'
import App from './comms-components/App'
import reducer from './comms-reducers'

const store = configureStore(reducer)
const mainEl = document.getElementsByTagName('main')[0]
const render = createApp(mainEl, store.dispatch)

store.subscribe(() => render(<App/>, store.getState()))
store.dispatch({ type: 'APP/INIT' })




import UDP from './network/udp'
const udp = new UDP()

const ourActions = {
  query: {
    description: 'Sends commands over multicast/custom IPs to discover robots.',
    time: 0,
    delay: 3000,
    fn: () => { udp.query({ something: 'meaningless' }) }
  },
  maintain: {
    description: 'Sends commands periodically to the current robot to measure latency.',
    time: 0,
    delay: 1000,
    fn: () => {}
  },
  update: {
    description: 'Sends commands frequently to change values.',
    time: 0,
    delay: 500,
    fn: () => {}
  },
  networkStatus: {
    description: 'Alters state to reflect state of sending/receiving.',
    time: 0,
    delay: 0,
    fn: () => {}
  }
}

const process = (actions) => {
  const now = Date.now()
  return Object.keys(actions).map((a) => {
    if (now - a.time > a.delay) {
      a.time = now
      return a.fn()
    }
    return null
  })
}

setInterval(() => {
  requestAnimationFrame(() => {
    process()
  })
}, 1000/30)
