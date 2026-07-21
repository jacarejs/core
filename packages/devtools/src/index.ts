import {
  enableDevtools,
  getPulseGraph,
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
import { writeUiConfig, type PanelCorner } from './config.js'

export interface ConnectOptions {
  target?: HTMLElement
  /** Mount the Scope panel (default true). */
  scope?: boolean
  /** Mount the Mesh panel for createBag addresses (default true). */
  mesh?: boolean
  /** Initial Pulse Graph corner (persisted in sessionStorage). */
  position?: PanelCorner
  /** Initial Scope corner (persisted in sessionStorage). */
  scopePosition?: PanelCorner
  /** Initial Mesh corner (persisted in sessionStorage). */
  meshPosition?: PanelCorner
}

export function connectJacareDevtools(options: ConnectOptions = {}): () => void {
  if (options.position || options.scopePosition || options.meshPosition) {
    writeUiConfig({
      ...(options.position ? { pulsePosition: options.position } : {}),
      ...(options.scopePosition ? { scopePosition: options.scopePosition } : {}),
      ...(options.meshPosition ? { meshPosition: options.meshPosition } : {}),
    })
  }

  enableDevtools()
  const host = options.target ?? document.body
  const panel = createPanel(host)
  const unsubscribe = subscribePulseGraph(() => {
    panel.render(getPulseGraph())
  })
  panel.render(getPulseGraph())
  const disposeScope = options.scope === false ? null : connectJacareScope({ target: host })
  const disposeMesh = options.mesh === false ? null : connectJacareMesh({ target: host })
  return () => {
    unsubscribe()
    panel.dispose()
    disposeScope?.()
    disposeMesh?.()
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
