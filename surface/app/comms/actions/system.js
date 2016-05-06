export const LOADING = 'system.load.pending'
export const LOADED = 'system.load.done'

import Promise from 'bluebird'
import batteryLevel from 'battery-level'
import osxInfo from 'osx-info'
import { get, set } from 'brightness'
import wifiName from 'wifi-name'
// import wifiPassword from 'wifi-password'

export const load = (dispatch) => () => {

  Promise.resolve()
  .then(() => set(1))
  .then(() => [
    batteryLevel(),
    get(),
    osxInfo(),
    wifiName()
    // wifiPassword()
  ])
  .all()
  .then(results => {

    const payload = {
      battery: results[0],
      brightness: results[1],
      osx: results[2],
      wifi: {
        name: results[3],
        password: results[4]
      }
    }

    dispatch({ type: LOADED, payload })

  })

}
