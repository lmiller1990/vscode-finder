// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from 'axios'
import { startServer } from './extensionServer'
import { endpoints } from './shared';
import { spawn } from 'child_process';

function createSpawnEnv() {
  const spawnEnv = JSON.parse(JSON.stringify(process.env))
  delete spawnEnv.ATOM_SHELL_INTERNAL_RUN_AS_NODE
  delete spawnEnv.ELECTRON_RUN_AS_NODE
  return spawnEnv
}

let hasLaunched = false

function launch(exists: boolean) {
  if (exists) {
    return axios.get(`${endpoints.electron.url}/focus`)
  }

  startServer()

  const root = '/Users/lachlan/code/dump/vscode-ext-advanced-finder'
  spawn(`${root}/node_modules/.bin/electron`, [
    `${root}/out/electron/main.js`
  ], {
    cwd: process.cwd(),
    stdio: ['pipe', 'pipe', 'pipe'],
    env: createSpawnEnv(),
  })

  hasLaunched = true
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('vscode-ext-advanced-finder.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from vscode-ext-advanced-finder!');

    // Display a message box to the user
    vscode.window.showInformationMessage('Hello World!');

    try {
      launch(hasLaunched)
    } catch (e) {
      vscode.window.showErrorMessage(e.message)
    }
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
