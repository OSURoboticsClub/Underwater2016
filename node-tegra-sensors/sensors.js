'use strict'
/* eslint camelcase: 0 */

const bluebird = require('bluebird')
const fs = bluebird.promisifyAll(require('fs'))

// 65ms
exports.getTemps = () => {
  return bluebird.resolve('/sys/devices/virtual/thermal/')
  .then(fs.readdirAsync)
  .then(zones => zones.filter(zone => /thermal_zone(\d*)/i.test(zone)))
  .then(exports.readTemps)
}

exports.readTemps = (zones) => {
  return bluebird.resolve(zones.map(zone => exports.readTemp(zone)))
  .all()
  .then(temps => {
    const obj = {}
    temps.forEach(temp => { obj[temp.type] = temp.temp })
    return obj
  })
}

// 50ms - why does it take so long?
exports.readTemp = (zone) => {
  return bluebird.all([
    fs.readFileAsync(`/sys/devices/virtual/thermal/${zone}/type`, 'utf-8'),
    fs.readFileAsync(`/sys/devices/virtual/thermal/${zone}/temp`, 'utf-8')
  ])
  .then(files => {
    return {
      type: String(files[0].slice(0, -1)),
      temp: parseInt(files[1].slice(0, -1), 10) / 1000
    }
  })
}

exports.getLoadavg = () => {
  return fs.readFileAsync('/proc/loadavg', 'utf-8')
  .then(file => file.split(' '))
  .then(fields => {
    return {
      '1m': parseFloat(fields[0]),
      '5m': parseFloat(fields[1]),
      '15m': parseFloat(fields[2]),
      exec: parseInt(fields[3].split('/')[0], 10),
      sched: parseInt(fields[3].split('/')[1], 10),
      total: parseInt(fields[4], 10)
    }
  })
}

exports.getStat = (limit) => {
  return fs.readFileAsync('/proc/stat', 'utf-8')
  .then(file => file.split('\n'))
  .then(lines => {
    let stats = {}
    lines.forEach(line => {
      const fields = line.split(/\s+/)
      function int (i) { return parseInt(fields[i], 10) }
      function cpuInfo () {
        return {
          user: int(1),
          nice: int(2),
          system: int(3),
          idle: int(4),
          iowait: int(5),
          irq: int(6),
          softirq: int(7),
          steal_time: int(8),
          virtual: int(9)
        }
      }

      if (limit && !limit.some(field => field === fields[0])) { return }

      switch (fields[0]) {

        case 'cpu':
          stats[fields[0]] = cpuInfo()
          break

        case 'intr':
          let intrInfo = {
            total: parseInt(fields[1], 10),
            intrs: fields.slice(2).map(count => parseInt(count, 10))
          }
          stats[fields[0]] = intrInfo
          break

        case 'btime':
          stats[fields[0]] = new Date(parseInt(fields[1], 10))
          break

        case 'ctxt':
        case 'processes':
        case 'procs_running':
        case 'procs_blocked':
          stats[fields[0]] = parseInt(fields[1], 10)
          break

        default:
          if (/cpu\d+/i.test(fields[0])) {
            stats[fields[0]] = cpuInfo()
            break
          }

      }

    })

    return stats
  })

}

exports.getCPUDiff = (time) => {
  let init, final, delay = time || 500
  return exports.getStat(['cpu'])
  .then(stat => { init = stat })
  .then(() => new Promise(resolve => setTimeout(resolve, delay)))
  .then(() => exports.getStat(['cpu']))
  .then(stat => { final = stat })
  .then(() => {
    const cpuDiff = {}
    Object.keys(init.cpu).forEach(k => {
      cpuDiff[k] = final.cpu[k] - init.cpu[k]
    })
    return cpuDiff
  })
}

exports.getCPUPercentage = (time) => {
  return exports.getCPUDiff(time)
  .then(diff => {
    let busy = diff.user + diff.nice + diff.system
    let idle = diff.idle
    let total = idle + busy
    return {
      idle: Math.floor(idle / total * 100),
      busy: Math.ceil(busy / total * 100)
    }

  })
}
