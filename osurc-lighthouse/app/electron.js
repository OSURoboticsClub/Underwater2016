import { app, BrowserWindow } from 'electron'
import { join } from 'path'

const windows = {
  comms: {
    window: null,
    options: { width: 800, height: 600, frame: true, show: true },
    url: `file://${join(__dirname, 'comms/index.html')}`,
    load: (window) => { window.webContents.openDevTools() }
  }
}

function openWindow (name) {
  let { window, url, options, load } = windows[name]
  if (window) {
    window.focus()
  } else {
    window = windows[name].window = new BrowserWindow(options)
    window.loadURL(url)
    window.webContents.on('did-finish-load', () => load(window))
    window.on('closed', () => { windows[name].window = null })
  }
}

const shouldQuit = app.makeSingleInstance((argv, pwd) => {
  app.emit('activate')
})

if (shouldQuit) {
  app.quit()
  process.exit()
}

app.on('ready', () => {
  openWindow('comms')
})

app.on('activate', () => {
  openWindow('comms')
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
