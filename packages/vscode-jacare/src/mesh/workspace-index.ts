import * as vscode from 'vscode'
import { buildBagIndexFromSources, isBagSourceFileName, type BagIndex } from './bag-index.js'

const SCAN_GLOB = '**/*.{jcr,js,mjs,cjs,ts,mts,cts}'
const SCAN_EXCLUDE = '**/{node_modules,dist,.git,.jacare}/**'

export class WorkspaceBagIndex {
  private index: BagIndex = new Map()
  private timer: ReturnType<typeof setTimeout> | undefined
  private readonly debounceMs = 300

  get(): BagIndex {
    return this.index
  }

  async refresh(): Promise<void> {
    const uris = await vscode.workspace.findFiles(SCAN_GLOB, SCAN_EXCLUDE)
    const files: Array<{ file: string; source: string }> = []

    for (const uri of uris) {
      if (!isBagSourceFileName(uri.fsPath)) continue
      try {
        const raw = await vscode.workspace.fs.readFile(uri)
        files.push({ file: uri.fsPath, source: Buffer.from(raw).toString('utf8') })
      } catch {
        // skip unreadable
      }
    }

    this.index = buildBagIndexFromSources(files)
  }

  scheduleRefresh(): void {
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      void this.refresh()
    }, this.debounceMs)
  }

  watch(context: vscode.ExtensionContext): void {
    const watcher = vscode.workspace.createFileSystemWatcher(SCAN_GLOB)
    const bump = () => this.scheduleRefresh()
    watcher.onDidCreate(bump)
    watcher.onDidChange(bump)
    watcher.onDidDelete(bump)
    context.subscriptions.push(watcher)
  }
}
