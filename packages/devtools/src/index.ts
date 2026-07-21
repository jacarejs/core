import {
  enableDevtools,
  getMeshSnapshot,
  getPulseGraph,
  getScopeSnapshot,
  startMeshPulse,
  startScopePulse,
  subscribeMesh,
  subscribePulseGraph,
  subscribeScope,
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
  /** Enable Scope tab (and optional pop-out window). Default true. */
  scope?: boolean
  /** Enable Mesh tab (and optional pop-out window). Default true. */
  mesh?: boolean
  /** Initial Pulse Graph corner (persisted in sessionStorage). */
  position?: PanelCorner
  /** Initial Scope window corner when popped out (persisted in sessionStorage). */
  scopePosition?: PanelCorner
  /** Initial Mesh window corner when popped out (persisted in sessionStorage). */
  meshPosition?: PanelCorner
  /** Start with Mesh in a separate window (default false — Mesh is a tab). */
  meshDetached?: boolean
  /** Start with Scope in a separate window (default false — Scope is a tab). */
  scopeDetached?: boolean
}

export function connectJacareDevtools(options: ConnectOptions = {}): () => void {
  if (
    options.position ||
    options.scopePosition ||
    options.meshPosition ||
    options.meshDetached != null ||
    options.scopeDetached != null
  ) {
    writeUiConfig({
      ...(options.position ? { pulsePosition: options.position } : {}),
      ...(options.scopePosition ? { scopePosition: options.scopePosition } : {}),
      ...(options.meshPosition ? { meshPosition: options.meshPosition } : {}),
      ...(options.meshDetached != null ? { meshDetached: options.meshDetached } : {}),
      ...(options.scopeDetached != null ? { scopeDetached: options.scopeDetached } : {}),
    })
  }

  enableDevtools()
  const host = options.target ?? document.body
  const meshEnabled = options.mesh !== false
  const scopeEnabled = options.scope !== false
  const panel = createPanel(host, { mesh: meshEnabled, scope: scopeEnabled })
  const unsubscribe = subscribePulseGraph(() => {
    panel.render(getPulseGraph())
  })
  panel.render(getPulseGraph())

  let disposeMeshWindow: (() => void) | null = null
  let stopMeshPulse: (() => void) | null = null
  let unsubscribeMesh: (() => void) | null = null

  let disposeScopeWindow: (() => void) | null = null
  let stopScopePulse: (() => void) | null = null
  let unsubscribeScope: (() => void) | null = null

  function syncMeshWindow(): void {
    const hasBags = getMeshSnapshot().bags.length > 0
    const detached = meshEnabled && hasBags && readUiConfig().meshDetached
    if (detached && !disposeMeshWindow) {
      disposeMeshWindow = connectJacareMesh({ target: host, pulseMs: false })
    } else if (!detached && disposeMeshWindow) {
      disposeMeshWindow()
      disposeMeshWindow = null
    }
  }

  function syncScopeWindow(): void {
    const hasEntries = getScopeSnapshot().entries.length > 0
    const detached = scopeEnabled && hasEntries && readUiConfig().scopeDetached
    if (detached && !disposeScopeWindow) {
      disposeScopeWindow = connectJacareScope({ target: host, pulseMs: false })
    } else if (!detached && disposeScopeWindow) {
      disposeScopeWindow()
      disposeScopeWindow = null
    }
  }

  if (meshEnabled) {
    stopMeshPulse = startMeshPulse(120)
    unsubscribeMesh = subscribeMesh(() => {
      panel.renderMesh(getMeshSnapshot())
      syncMeshWindow()
    })
    panel.renderMesh(getMeshSnapshot())
    syncMeshWindow()
  }

  if (scopeEnabled) {
    stopScopePulse = startScopePulse(120)
    unsubscribeScope = subscribeScope(() => {
      panel.renderScope(getScopeSnapshot())
      syncScopeWindow()
    })
    panel.renderScope(getScopeSnapshot())
    syncScopeWindow()
  }

  const onMeshDetached = (): void => {
    syncMeshWindow()
  }
  const onScopeDetached = (): void => {
    syncScopeWindow()
  }
  window.addEventListener('jacare:devtools:mesh-detached', onMeshDetached)
  window.addEventListener('jacare:devtools:scope-detached', onScopeDetached)

  return () => {
    window.removeEventListener('jacare:devtools:mesh-detached', onMeshDetached)
    window.removeEventListener('jacare:devtools:scope-detached', onScopeDetached)
    unsubscribe()
    unsubscribeMesh?.()
    stopMeshPulse?.()
    disposeMeshWindow?.()
    unsubscribeScope?.()
    stopScopePulse?.()
    disposeScopeWindow?.()
    panel.dispose()
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
