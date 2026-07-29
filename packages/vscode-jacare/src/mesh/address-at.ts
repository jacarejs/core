import {
  findMeshAddressAt,
  meshAddressResolveExpr,
  type MeshAddressHit,
} from '@jacare/compiler/mesh-address'

export type AddressAtCursor = MeshAddressHit & {
  resolveExpr: string
  isRoute: boolean
}

export function addressAtOffset(text: string, offset: number): AddressAtCursor | null {
  const hit = findMeshAddressAt(text, offset)
  if (!hit) return null
  return {
    ...hit,
    resolveExpr: meshAddressResolveExpr(hit.bag, hit.key),
    isRoute: hit.bag === 'route',
  }
}
