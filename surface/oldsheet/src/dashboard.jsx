/** @jsx element */
import { element, createApp } from 'deku'
import { configureStore } from './store'
import App from './components/App'

const store = configureStore()
const mainEl = document.getElementsByTagName('main')[0]
const render = createApp(mainEl, store.dispatch)

store.subscribe(() => render(<App/>, store.getState()))
store.dispatch({ type: 'APP/INIT' })
