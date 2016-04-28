'use strict'
/* eslint no-console: 0 */
/* eslint camelcase: 0 */

const bluebird = require('bluebird')
const i2c = require('i2c-bus')

const openBus = bluebird.promisify((n, cb) => {
  const bus = i2c.open(n, (err) => {
    if (err) { return cb(err) }
    return cb(null, bluebird.promisifyAll(bus))
  })
})

let bus, buffer = new Buffer(3), coefficients = []

openBus(1).then(b => { bus = b })

.then(() => {
  return [
    bus.readWordAsync(0x76, 0xA0),
    bus.readWordAsync(0x76, 0xA2),
    bus.readWordAsync(0x76, 0xA4),
    bus.readWordAsync(0x76, 0xA6),
    bus.readWordAsync(0x76, 0xA8),
    bus.readWordAsync(0x76, 0xAA),
    bus.readWordAsync(0x76, 0xAC),
    bus.readWordAsync(0x76, 0xAE)
  ]
})
.all()
.then(console.log)


.then(() => bus.readI2cBlockAsync(0x76, 0xA2, 2, buffer))
.then(() => (buffer[1] << 8) | buffer[0])
.then(c2 => console.log(c2))

.then(() => bus.readI2cBlockAsync(0x76, 0xA2, 2, buffer))
.then(() => (buffer[0] << 8) | buffer[1])
.then(c2 => console.log(c2))

.then(() => bus.sendByteAsync(0x76, 0x48))
.then(() => new Promise(resolve => setTimeout(resolve, 10)))
.then(() => bus.readI2cBlockAsync(0x76, 0x00, 3, buffer))
.then(() => (buffer[0] << 16) | (buffer[1] << 8) | buffer[2])
.then(temp_raw => console.log(temp_raw))














/**

.then(() => bus.readI2cBlockAsync(0x76, 0xA2, 2, buffer))
.then(pushWord)

.then(() => bus.readI2cBlockAsync(0x76, 0xA4, 2, buffer))
.then(pushWord)

.then(() => bus.readI2cBlockAsync(0x76, 0xA6, 2, buffer))
.then(pushWord)

.then(() => bus.readI2cBlockAsync(0x76, 0xA8, 2, buffer))
.then(pushWord)

.then(() => bus.readI2cBlockAsync(0x76, 0xAA, 2, buffer))
.then(pushWord)

.then(() => bus.readI2cBlockAsync(0x76, 0xAC, 2, buffer))
.then(pushWord)

.then(() => bus.readI2cBlockAsync(0x76, 0xAE, 2, buffer))
.then(pushWord)

.then(() => bus.sendByteAsync(0x76, 0x48))
.then(() => bus.readI2cBlockAsync(0x76, 0x00, 3, buffer))
.then(() => { return (buffer[0] << 16) | (buffer[1] << 8) | buffer[2] })

.then((temp) => {

  let temperature_raw = temp
  // let pressure_raw = getADCconversion(PRESSURE, _precision)

  // Create Variables for calculations
  let temp_calc
  // let pressure_calc
  let dT

  // Now that we have a raw temperature, let's compute our actual.
  dT = temperature_raw - (coefficients[5] << 8)
  temp_calc = ((dT * coefficients[6]) >> 23) + 2000

  // TODO TESTING  _temperature_actual = temp_calc;

  // Now we have our first order Temperature, let's calculate the second order.
  let T2, OFF2, SENS2, OFF, SENS

  if (temp_calc < 2000) {

    // If temp_calc is below 20.0C
    T2 = 3 * ((dT * dT) >> 33)
    OFF2 = 3 * ((temp_calc - 2000) * (temp_calc - 2000)) / 2
    SENS2 = 5 * ((temp_calc - 2000) * (temp_calc - 2000)) / 8

    if (temp_calc < -1500) {
      // If temp_calc is below -15.0C
      OFF2 = OFF2 + 7 * ((temp_calc + 1500) * (temp_calc + 1500))
      SENS2 = SENS2 + 4 * ((temp_calc + 1500) * (temp_calc + 1500))
    }

  } else {

    // If temp_calc is above 20.0C
    T2 = 7 * (dT * dT) / Math.pow(2, 37)
    OFF2 = ((temp_calc - 2000) * (temp_calc - 2000)) / 16
    SENS2 = 0

  }

  // Now bring it all together to apply offsets

  OFF = (coefficients[2] << 16) + (((coefficients[4] * dT)) >> 7)
  SENS = (coefficients[1] << 15) + (((coefficients[3] * dT)) >> 8)

  temp_calc = temp_calc - T2
  OFF = OFF - OFF2
  SENS = SENS - SENS2

  // Now lets calculate the pressure

  pressure_calc = (((SENS * pressure_raw) / 2097152 ) - OFF) / 32768;

  _temperature_actual = temp_calc ;
  _pressure_actual = pressure_calc ; // 10;// pressure_calc;


  console.log('temp', temp_calc)

})
*/
