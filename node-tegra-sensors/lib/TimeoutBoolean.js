'use strict'

const EventEmitter = require('eventemitter2')

module.exports = class TimeoutBoolean extends EventEmitter {

  constructor (delay) {
    super()
    this.delay = delay
    this.value = false
    this.timeout = null
  }

  set (val) {
    const value = !!val
    // Clear existing pending timeout.
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }
    // Skip if we are setting false.
    // Set timeout if we are setting true.
    if (value) {
      this.timeout = setTimeout(() => {
        // If the delay passes, change to false.
        this.timeout = null
        this.set(false)
      }, this.delay)
    }
    // Emit change event if appropiate and save.
    const isDifferent = value !== this.value
    this.value = value
    // Do event last in case something errors.
    if (isDifferent) { this.emit('change', value) }
  }

}
