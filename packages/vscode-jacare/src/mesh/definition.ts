import * as vscode from 'vscode'
import { addressAtOffset } from './address-at.js'
import type { BagIndex } from './bag-index.js'

export function createMeshDefinitionProvider(
  getIndex: () => BagIndex,
): vscode.DefinitionProvider {
  return {
    provideDefinition(document, position) {
      const offset = document.offsetAt(position)
      const hit = addressAtOffset(document.getText(), offset)
      if (!hit || hit.isRoute) return null

      const entry = getIndex().get(hit.bag)
      const site = entry?.sites[0]
      if (!site) return null

      return new vscode.Location(
        vscode.Uri.file(site.file),
        new vscode.Position(site.line, site.character),
      )
    },
  }
}
