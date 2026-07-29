import * as vscode from 'vscode'
import { collectCompileDiagnostics } from './collect.js'

const DEBOUNCE_MS = 250

function isJacareDocument(doc: vscode.TextDocument): boolean {
  return doc.languageId === 'jacare' || doc.uri.fsPath.endsWith('.jcr')
}

async function readSiblingScript(doc: vscode.TextDocument): Promise<string | false> {
  if (!doc.uri.fsPath.endsWith('.jcr')) return false
  const sibling = vscode.Uri.file(`${doc.uri.fsPath}.ts`)
  try {
    const raw = await vscode.workspace.fs.readFile(sibling)
    return Buffer.from(raw).toString('utf8')
  } catch {
    return false
  }
}

export class JacareDiagnostics {
  private readonly collection = vscode.languages.createDiagnosticCollection('jacare')
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>()

  activate(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
      this.collection,
      vscode.workspace.onDidOpenTextDocument((doc) => this.schedule(doc)),
      vscode.workspace.onDidChangeTextDocument((event) => this.schedule(event.document)),
      vscode.workspace.onDidSaveTextDocument((doc) => this.schedule(doc, 0)),
      vscode.workspace.onDidCloseTextDocument((doc) => {
        this.clearTimer(doc.uri.toString())
        this.collection.delete(doc.uri)
      }),
    )

    for (const doc of vscode.workspace.textDocuments) {
      this.schedule(doc)
    }
  }

  private clearTimer(key: string): void {
    const timer = this.timers.get(key)
    if (timer) clearTimeout(timer)
    this.timers.delete(key)
  }

  private schedule(doc: vscode.TextDocument, delay = DEBOUNCE_MS): void {
    if (doc.uri.scheme !== 'file' && doc.uri.scheme !== 'untitled') return
    if (!isJacareDocument(doc)) return

    const key = doc.uri.toString()
    this.clearTimer(key)
    this.timers.set(
      key,
      setTimeout(() => {
        this.timers.delete(key)
        void this.refresh(doc)
      }, delay),
    )
  }

  private async refresh(doc: vscode.TextDocument): Promise<void> {
    if (doc.isClosed) return
    const sibling = await readSiblingScript(doc)
    const items = collectCompileDiagnostics(doc.getText(), doc.uri.fsPath, sibling)
    const diagnostics = items.map((item) => {
      const range = new vscode.Range(item.line, item.column, item.endLine, item.endColumn)
      const diagnostic = new vscode.Diagnostic(
        range,
        item.message,
        vscode.DiagnosticSeverity.Error,
      )
      diagnostic.source = 'jacare'
      return diagnostic
    })
    this.collection.set(doc.uri, diagnostics)
  }
}
