import { getBag, listBags } from '@jacare/core'

export function exportMesh(): Record<string, Record<string, unknown>> {
  const out: Record<string, Record<string, unknown>> = {}
  for (const id of listBags()) {
    const bag = getBag(id)
    if (bag) out[id] = bag.snap()
  }
  return out
}

export function downloadMesh(): void {
  const data = exportMesh()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'jacare-mesh.json'
  a.click()
  URL.revokeObjectURL(url)
}

export function importMesh(data: unknown): string[] {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return []
  const hydrated: string[] = []
  for (const [id, snap] of Object.entries(data as Record<string, unknown>)) {
    const bag = getBag(id)
    if (!bag || !snap || typeof snap !== 'object' || Array.isArray(snap)) continue
    bag.hydrate(snap as Record<string, unknown>)
    hydrated.push(id)
  }
  return hydrated
}

export function importMeshFromFile(file: File): Promise<string[]> {
  return file.text().then((text) => importMesh(JSON.parse(text)))
}
