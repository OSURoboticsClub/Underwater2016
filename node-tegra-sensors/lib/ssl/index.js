'use strict'

var bluebird = require('bluebird')
var fs = require('fs')
var path = require('path')

const readFileAsync = bluebird.promisify(fs.readFile)

module.exports.load = function load () {
  return bluebird.resolve([
    readFileAsync(path.join(__dirname, 'ca.crt')),
    readFileAsync(path.join(__dirname, 'ca.key')),
    readFileAsync(path.join(__dirname, 'surface.crt')),
    readFileAsync(path.join(__dirname, 'surface.key')),
    readFileAsync(path.join(__dirname, 'underwater.crt')),
    readFileAsync(path.join(__dirname, 'underwater.key'))
  ])
  .all()
  .then((files) => {
    return {
      ca: {
        cert: files[0],
        key: files[1]
      },
      surface: {
        cert: files[2],
        key: files[3]
      },
      underwater: {
        cert: files[4],
        key: files[5]
      }
    }
  })
}
