import { app, BrowserWindow } from 'electron'
import { join } from 'path'

const windows = {
  dashboard: null,
  comms: null
}

function openDashboard () {
  if (windows.dashboard) { windows.dashboard.focus(); return }
  windows.dashboard = new BrowserWindow({ frame: false, show: false })
  windows.dashboard.loadURL('file://' + join(__dirname, '../static/dashboard.html'))
  windows.dashboard.webContents.on('did-finish-load', () => windows.dashboard.show())
  windows.dashboard.on('closed', () => { windows.dashboard = null })
}

function openComms () {
  if (windows.comms) { windows.comms.focus(); return }
  windows.comms = new BrowserWindow({ width: 180, height: 180, frame: true, show: false })
  windows.comms.loadURL('file://' + join(__dirname, '../static/comms.html'))
  windows.comms.webContents.on('did-finish-load', () => windows.comms.show())
  windows.comms.on('closed', () => { windows.comms = null })
}

app.on('ready', () => {
  openDashboard()
  openComms()
})

app.on('activate', () => {
  openDashboard()
  openComms()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
