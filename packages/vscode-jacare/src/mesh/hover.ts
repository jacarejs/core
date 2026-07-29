import * as vscode from 'vscode'
import { addressAtOffset } from './address-at.js'
import type { BagIndex } from './bag-index.js'
import { formatMeshHoverMarkdown } from './markdown.js'

export function createMeshHoverProvider(getIndex: () => BagIndex): vscode.HoverProvider {
  return {
    provideHover(document, position) {
      const offset = document.offsetAt(position)
      const hit = addressAtOffset(document.getText(), offset)
      if (!hit) return null

      const entry = hit.isRoute ? undefined : getIndex().get(hit.bag)
      const siteFile = entry?.sites[0]?.file
      const relativePath = siteFile
        ? vscode.workspace.asRelativePath(siteFile, false)
        : undefined

      const markdown = new vscode.MarkdownString(
        formatMeshHoverMarkdown({
          bag: hit.bag,
          key: hit.key,
          resolveExpr: hit.resolveExpr,
          isRoute: hit.isRoute,
          entry,
          ...(relativePath ? { relativePath } : {}),
        }),
      )
      markdown.isTrusted = true

      const range = new vscode.Range(
        document.positionAt(hit.start),
        document.positionAt(hit.end),
      )
      return new vscode.Hover(markdown, range)
    },
  }
}
