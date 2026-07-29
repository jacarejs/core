import { offsetToLineCharacter } from '@jacare/compiler/mesh-address'
import { scanBagPublishSites } from '@jacare/compiler/scan-bags'
import type { BagIndexEntry, BagSiteInfo } from './markdown.js'

export type BagIndex = Map<string, BagIndexEntry>

export function buildBagIndexFromSources(
  files: Array<{ file: string; source: string }>,
): BagIndex {
  const index: BagIndex = new Map()

  for (const { file, source } of files) {
    for (const site of scanBagPublishSites(source)) {
      const pos = offsetToLineCharacter(source, site.index)
      const info: BagSiteInfo = {
        file,
        line: pos.line,
        character: pos.character,
        keys: site.keys,
      }
      let entry = index.get(site.id)
      if (!entry) {
        entry = { id: site.id, keys: new Set(), sites: [] }
        index.set(site.id, entry)
      }
      for (const key of site.keys) entry.keys.add(key)
      entry.sites.push(info)
    }
  }

  return index
}

export function isBagSourceFileName(name: string): boolean {
  if (name.endsWith('.d.ts')) return false
  return /\.(jcr|js|mjs|cjs|ts|mts|cts)$/.test(name)
}
