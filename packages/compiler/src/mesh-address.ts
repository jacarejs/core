/**
 * Mesh address sugar `@bag/key` — shared by compiler emit and VS Code hover.
 * Kept dependency-free so tooling can import this module alone.
 */

export type MeshAddressHit = {
  bag: string
  key: string
  start: number
  end: number
}

/** Same pattern as grammar `variable.other.mesh-address.jacare`. */
export const MESH_ADDRESS_IN_TEXT_RE = /@([A-Za-z_$][\w$-]*)\/([A-Za-z_$][\w$]*)/g

/** Find `@bag/key` covering `offset` (inclusive start, exclusive end for caret at end). */
export function findMeshAddressAt(text: string, offset: number): MeshAddressHit | null {
  MESH_ADDRESS_IN_TEXT_RE.lastIndex = 0
  for (const match of text.matchAll(MESH_ADDRESS_IN_TEXT_RE)) {
    const start = match.index ?? 0
    const end = start + match[0].length
    if (offset >= start && offset <= end) {
      return { bag: match[1]!, key: match[2]!, start, end }
    }
  }
  return null
}

/** Hot-path expression the compiler emits for address sugar. */
export function meshAddressResolveExpr(bag: string, key: string): string {
  if (bag === 'route') {
    return `getRouteParam(${JSON.stringify(key)})`
  }
  return `getBag(${JSON.stringify(bag)})?.${key}`
}

export function offsetToLineCharacter(
  source: string,
  offset: number,
): { line: number; character: number } {
  let line = 0
  let character = 0
  const end = Math.min(Math.max(0, offset), source.length)
  for (let i = 0; i < end; i++) {
    if (source[i] === '\n') {
      line++
      character = 0
    } else {
      character++
    }
  }
  return { line, character }
}
