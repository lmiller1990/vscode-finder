import express from 'express'
import { BrowserWindow } from 'electron'
import { endpoints } from './shared'

export function startServer(window: BrowserWindow) {
  const server = express()

  server.get('/focus', () => {
    window.focus()
    window.show()
  })

  server.listen(endpoints.electron.port)
}
