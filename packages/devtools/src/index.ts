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
import { writeUiConfig, type PanelCorner } from './config.js'

export interface ConnectOptions {
  target?: HTMLElement
  /** Mount the Scope panel (default true). */
  scope?: boolean
  /** Initial Pulse Graph corner (persisted in sessionStorage). */
  position?: PanelCorner
  /** Initial Scope corner (persisted in sessionStorage). */
  scopePosition?: PanelCorner
}

export function connectJacareDevtools(options: ConnectOptions = {}): () => void {
  if (options.position || options.scopePosition) {
    writeUiConfig({
      ...(options.position ? { pulsePosition: options.position } : {}),
      ...(options.scopePosition ? { scopePosition: options.scopePosition } : {}),
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
  return () => {
    unsubscribe()
    panel.dispose()
    disposeScope?.()
  }
}

export type { PulseGraphSnapshot, PulseNode, BindingMeta, PulseBinding, DevtoolsMeta, PanelCorner }
export { connectJacareScope } from './scope.js'
export type { ConnectScopeOptions, ScopeSnapshot } from './scope.js'
export {
  highlightBinding,
  clearHighlight,
  flashDom,
  pickElement,
  getBindingsForPulse,
  getPulsesForElement,
  namePulse,
  devtoolsBind,
  clearScope,
} from '@jacare/core'
export { readUiConfig, writeUiConfig } from './config.js'
