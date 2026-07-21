import {
  enableDevtools,
  getMeshSnapshot,
  getPulseGraph,
  startMeshPulse,
  subscribeMesh,
  subscribePulseGraph,
  type PulseGraphSnapshot,
  type PulseNode,
  type BindingMeta,
  type PulseBinding,
  type DevtoolsMeta,
} from '@jacare/core'
import { createPanel } from './panel.js'
import { connectJacareScope } from './scope.js'
import { connectJacareMesh } from './mesh.js'
import { readUiConfig, writeUiConfig, type PanelCorner } from './config.js'

export interface ConnectOptions {
  target?: HTMLElement
  /** Mount the Scope panel (default true). */
  scope?: boolean
  /** Enable Mesh tab (and optional pop-out window). Default true. */
  mesh?: boolean
  /** Initial Pulse Graph corner (persisted in sessionStorage). */
  position?: PanelCorner
  /** Initial Scope corner (persisted in sessionStorage). */
  scopePosition?: PanelCorner
  /** Initial Mesh window corner when popped out (persisted in sessionStorage). */
  meshPosition?: PanelCorner
  /** Start with Mesh in a separate window (default false — Mesh is a tab). */
  meshDetached?: boolean
}

export function connectJacareDevtools(options: ConnectOptions = {}): () => void {
  if (
    options.position ||
    options.scopePosition ||
    options.meshPosition ||
    options.meshDetached != null
  ) {
    writeUiConfig({
      ...(options.position ? { pulsePosition: options.position } : {}),
      ...(options.scopePosition ? { scopePosition: options.scopePosition } : {}),
      ...(options.meshPosition ? { meshPosition: options.meshPosition } : {}),
      ...(options.meshDetached != null ? { meshDetached: options.meshDetached } : {}),
    })
  }

  enableDevtools()
  const host = options.target ?? document.body
  const meshEnabled = options.mesh !== false
  const panel = createPanel(host, { mesh: meshEnabled })
  const unsubscribe = subscribePulseGraph(() => {
    panel.render(getPulseGraph())
  })
  panel.render(getPulseGraph())

  let disposeMeshWindow: (() => void) | null = null
  let stopMeshPulse: (() => void) | null = null
  let unsubscribeMesh: (() => void) | null = null

  function syncMeshWindow(): void {
    const detached = meshEnabled && readUiConfig().meshDetached
    if (detached && !disposeMeshWindow) {
      disposeMeshWindow = connectJacareMesh({ target: host, pulseMs: false })
    } else if (!detached && disposeMeshWindow) {
      disposeMeshWindow()
      disposeMeshWindow = null
    }
  }

  if (meshEnabled) {
    stopMeshPulse = startMeshPulse(120)
    unsubscribeMesh = subscribeMesh(() => {
      panel.renderMesh(getMeshSnapshot())
    })
    panel.renderMesh(getMeshSnapshot())
    syncMeshWindow()
  }

  const onMeshDetached = (): void => {
    syncMeshWindow()
  }
  window.addEventListener('jacare:devtools:mesh-detached', onMeshDetached)

  const disposeScope = options.scope === false ? null : connectJacareScope({ target: host })
  return () => {
    window.removeEventListener('jacare:devtools:mesh-detached', onMeshDetached)
    unsubscribe()
    unsubscribeMesh?.()
    stopMeshPulse?.()
    disposeMeshWindow?.()
    panel.dispose()
    disposeScope?.()
  }
}

export type { PulseGraphSnapshot, PulseNode, BindingMeta, PulseBinding, DevtoolsMeta, PanelCorner }
export { connectJacareScope } from './scope.js'
export type { ConnectScopeOptions, ScopeSnapshot } from './scope.js'
export { connectJacareMesh } from './mesh.js'
export type { ConnectMeshOptions, MeshSnapshot } from './mesh.js'
export {
  highlightBinding,
  clearHighlight,
  flashDom,
  pickElement,
  getBindingsForPulse,
  getPulsesForElement,
  namePulse,
  getMeshSnapshot,
  subscribeMesh,
  startMeshPulse,
  listBags,
  getBag,
  devtoolsBind,
  clearScope,
} from '@jacare/core'
export { readUiConfig, writeUiConfig } from './config.js'
