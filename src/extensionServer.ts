import express from 'express'
import vscode from 'vscode'
import { getFiles } from './utils'
import { endpoints } from './shared'

export function startServer() {
  const app = express()

  app.get('/files', async (req, res) => {
    const cwd = process.cwd()
    const files = await getFiles()
    res.json({ files, cwd })
  })

  app.get('/focus', async (req, res) => {
    const file = req.query.file as string
    const openPath = vscode.Uri.file(file)
    const doc = await vscode.workspace.openTextDocument(openPath)
    vscode.window.showTextDocument(doc, {})
    res.end()
  })

  app.listen(endpoints.extension.port, endpoints.extension.host)
}