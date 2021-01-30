const { ipcRenderer } = require('electron')

function minimize() {
  ipcRenderer.send('minimize')
}