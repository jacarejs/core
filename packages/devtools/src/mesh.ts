import {
  getMeshSnapshot,
  startMeshPulse,
  subscribeMesh,
  type MeshSnapshot,
} from '@jacare/core'
import { createMeshPanel } from './mesh-panel.js'

export interface ConnectMeshOptions {
  target?: HTMLElement
  pulseMs?: number
}

export function connectJacareMesh(options: ConnectMeshOptions = {}): () => void {
  const host = options.target ?? document.body
  const panel = createMeshPanel(host)
  const stopPulse = startMeshPulse(options.pulseMs ?? 120)
  const unsubscribe = subscribeMesh(() => {
    panel.render(getMeshSnapshot())
  })
  panel.render(getMeshSnapshot())
  return () => {
    unsubscribe()
    stopPulse()
    panel.dispose()
  }
}

export type { MeshSnapshot }
