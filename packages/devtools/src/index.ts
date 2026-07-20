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

export interface ConnectOptions {
  target?: HTMLElement
  scope?: boolean
}

export function connectJacareDevtools(options: ConnectOptions = {}): () => void {
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

export type { PulseGraphSnapshot, PulseNode, BindingMeta, PulseBinding, DevtoolsMeta }
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
} from '@jacare/core'
