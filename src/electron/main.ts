import { app, BrowserWindow, ipcMain } from 'electron'
import { startServer } from '../electronServer'

async function createWindow() {
  const window = new BrowserWindow({
    width: 650,
    height: 700,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      devTools: true
    }
  })
  window.loadFile('index.html')
  window.webContents.openDevTools()

  startServer(window)
}

ipcMain.on('minimize', () => {
  app.hide()
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
