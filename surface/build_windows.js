'use strict'

const packager = require('electron-packager')
const options = {
  dir: '.',
  arch: 'x64',
  asar: false,
  ignore: [],
  prune: true,
  overwrite: true,
  'app-version': null,
  'app-copyright': null,
  'build-version': null,
  // windows
  platform: 'win32',
  icon: null,
  'version-string': {
    CompanyName: '@maccelerated',
    FileDescription: null,
    OriginalFilename: null,
    ProductName: null,
    InternalName: null
  }
}

packager(options, (err, appPath) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
})
