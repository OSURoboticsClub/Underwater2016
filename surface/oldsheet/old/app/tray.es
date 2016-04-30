import { app, Menu, MenuItem, Tray } from 'electron'
import notifier from 'node-notifier'

const path = require('path')
const largeIconPath = path.join(__dirname, '../images/Lighthouse-96-inv.png')
const whiteIconPath = path.join(__dirname, '../images/Lighthouse-36-inv.png')
const blackIconPath = path.join(__dirname, '../images/Lighthouse-36.png')

const testNotification = () => {
  notifier.notify({
    title: 'Test Notification',
    message: 'Yes, everything is going according to plan!',
    icon: largeIconPath,
    sound: true
  })
}


const menu = new Menu()
menu.append(new MenuItem({ label: 'Open', click: () => app.emit('activate') }))
menu.append(new MenuItem({ label: 'Test Notification', click: testNotification }))
menu.append(new MenuItem({ type: 'separator' }))
menu.append(new MenuItem({ label: 'Quit', click: () => app.quit() }))


let appIcon
app.on('ready', () => {
  appIcon = new Tray(whiteIconPath)
  if (process.platform === 'darwin') {
    appIcon.setImage(blackIconPath)
    appIcon.setPressedImage(whiteIconPath)
  }
  appIcon.setToolTip('Lighthouse')
  appIcon.setContextMenu(menu)
})
