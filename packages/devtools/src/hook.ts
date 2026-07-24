import {
  clearHighlight,
  enableDevtools,
  flashDom,
  getBindingsForPulse,
  getPulseGraph,
  getPulsesForElement,
  highlightBinding,
  isDevtoolsEnabled,
  pickElement,
} from '@jacare/core'

const PROTOCOL = 1

export interface InstallPageHookOptions {
  coreVersion?: string | null
}

type GlobalWithJacare = typeof globalThis & {
  __JACARE_DEVTOOLS_HOOK__?: JacareDevtoolsHook
  __JACARE__?: Record<string, unknown>
}

export interface JacareDevtoolsHook {
  protocol: number
  coreVersion: string | null
  enable: () => void
  isEnabled: () => boolean
  getGraph: () => ReturnType<typeof getPulseGraph>
  getBindings: (pulseId: number) => ReturnType<typeof getBindingsForPulse>
  highlight: (pulseId: number) => void
  clearHighlight: () => void
  flash: (pulseId: number) => void
  pickElement: () => Promise<{ pulseIds: number[] }>
}

/**
 * Installs window.__JACARE_DEVTOOLS_HOOK__ for the Chrome extension page-hook.
 * Safe to call multiple times. Does not enable collection until the extension asks.
 */
export function installPageHook(options: InstallPageHookOptions = {}): () => void {
  const version = options.coreVersion ?? null
  const g = globalThis as GlobalWithJacare

  const hook: JacareDevtoolsHook = {
    protocol: PROTOCOL,
    coreVersion: version,
    enable() {
      enableDevtools()
    },
    isEnabled() {
      return isDevtoolsEnabled()
    },
    getGraph() {
      return getPulseGraph()
    },
    getBindings(pulseId: number) {
      return getBindingsForPulse(pulseId)
    },
    highlight(pulseId: number) {
      highlightBinding(pulseId)
    },
    clearHighlight() {
      clearHighlight()
    },
    flash(pulseId: number) {
      const bindings = getBindingsForPulse(pulseId)
      const target = bindings[0]?.target
      if (target) flashDom(target)
    },
    async pickElement() {
      const el = await pickElement()
      if (!el) return { pulseIds: [] }
      return { pulseIds: getPulsesForElement(el) }
    },
  }

  g.__JACARE_DEVTOOLS_HOOK__ = hook
  g.__JACARE__ = {
    version,
    enableDevtools,
    isDevtoolsEnabled,
    getPulseGraph,
    getBindingsForPulse,
    getPulsesForElement,
    highlightBinding,
    clearHighlight,
    flashDom,
    pickElement,
  }

  return () => {
    if (g.__JACARE_DEVTOOLS_HOOK__ === hook) {
      delete g.__JACARE_DEVTOOLS_HOOK__
    }
  }
}
