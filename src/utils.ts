import { join } from 'path'
import { workspace, Uri } from 'vscode'
import { exec } from 'child_process'
import { File } from './types'

// https://github.com/microsoft/vscode/issues/48674#issuecomment-422950502
async function findNonIgnoredFiles(pattern: string, checkGitIgnore = true) {
  const exclude = [
    ...Object.keys(await workspace.getConfiguration('search', null).get('exclude') || {}),
    ...Object.keys(await workspace.getConfiguration('files', null).get('exclude') || {})
  ].join(',')

  const uris = await workspace.findFiles(pattern, `{${exclude}}`)
  if (!checkGitIgnore) {
    return uris
  }

  const workspaceRelativePaths = uris.map(uri => workspace.asRelativePath(uri, false))
  for (const workspaceDirectory of workspace.workspaceFolders!) {
    const workspaceDirectoryPath = workspaceDirectory.uri.fsPath
    const { stdout, stderr } = await new Promise<{ stdout: string, stderr: string }>((resolve, reject) => {
      exec(
        `git check-ignore ${workspaceRelativePaths.join(' ')}`,
        { cwd: workspaceDirectoryPath },
        // https://git-scm.com/docs/git-check-ignore#_exit_status
        // @ts-ignore
        (error: Error & { code?: 0 | 1 | 128 }, stdout, stderr) => {
          if (error && (error.code !== 0 && error.code !== 1)) {
            reject(error)
            return
          }

          resolve({ stdout, stderr })
        },
      )
    })

    if (stderr) {
      throw new Error(stderr)
    }

    for (const relativePath of stdout.split('\n')) {
      const uri = Uri.file(join(workspaceDirectoryPath, relativePath.slice(1, -1) /* Remove quotes */))
      const index = uris.findIndex(u => u.fsPath === uri.fsPath)
      if (index > -1) {
        uris.splice(index, 1)
      }
    }
  }

  return uris
}

export async function getFiles () {
  return findNonIgnoredFiles('**/*').then((files) => {
    return files.map<File>(file => ({ absolute: file.path }))
  })
}