;(function installJacareDevtoolsPageHook() {
  const SOURCE_PAGE = 'jacare-devtools-page'
  const SOURCE_CONTENT = 'jacare-devtools-content'
  const PROTOCOL = 2

  function reply(requestId, payload) {
    window.postMessage(
      {
        source: SOURCE_PAGE,
        kind: 'response',
        requestId,
        payload,
      },
      '*',
    )
  }

  function getApi() {
    const hook = globalThis.__JACARE_DEVTOOLS_HOOK__
    if (hook && typeof hook === 'object') return hook

    const core = globalThis.__JACARE__
    if (core && typeof core === 'object') {
      return {
        protocol: PROTOCOL,
        coreVersion: core.version,
        enable: () => core.enableDevtools?.(),
        isEnabled: () => Boolean(core.isDevtoolsEnabled?.()),
        getGraph: () => core.getPulseGraph?.() ?? { nodes: [], edges: [], updatedAt: Date.now() },
        getBindings: (pulseId) => {
          const list = core.getBindingsForPulse?.(pulseId) ?? []
          return list.map((binding) => serializeBindingFallback(binding))
        },
        getRoute: () => readRouteFallback(),
        getInspect: () => null,
        highlight: (pulseId) => core.highlightBinding?.(pulseId),
        clearHighlight: () => core.clearHighlight?.(),
        flash: (pulseId) => {
          const bindings = core.getBindingsForPulse?.(pulseId) ?? []
          const first = bindings[0]
          if (first?.target) core.flashDom?.(first.target)
          else if (first?.node) core.flashDom?.(first.node)
        },
        pickElement: async () => {
          const el = await core.pickElement?.()
          if (!el) return { pulseIds: [] }
          return { pulseIds: core.getPulsesForElement?.(el) ?? [] }
        },
      }
    }
    return null
  }

  function serializeBindingFallback(binding) {
    const target = binding?.target ?? binding?.node
    const el =
      target && target.nodeType === 1
        ? target
        : target?.parentElement
    return {
      pulseId: binding.pulseId,
      kind: binding.kind ?? 'bind',
      file: binding.file,
      line: binding.line,
      tag: el?.tagName?.toLowerCase?.(),
      id: el?.id || undefined,
      className: typeof el?.className === 'string' ? el.className : undefined,
    }
  }

  function readRouteFallback() {
    const raw = globalThis.__JACARE_NAV__
    let place = null
    let base = null
    let screens = []
    try {
      if (raw?.nav?.where) {
        place = typeof raw.nav.where === 'function' ? raw.nav.where() : raw.nav.where.peek
        base = raw.base ?? null
        screens = Array.isArray(raw.screens) ? raw.screens : []
      } else if (raw?.where) {
        place = typeof raw.where === 'function' ? raw.where() : raw.where.peek
      }
    } catch {
      place = null
    }
    if (!place && typeof location !== 'undefined') {
      return {
        path: location.pathname,
        params: {},
        search: Object.fromEntries(new URLSearchParams(location.search)),
        hash: location.hash,
        href: `${location.pathname}${location.search}${location.hash}`,
        title: document.title || '',
        base: null,
        screens: [],
      }
    }
    if (!place) return null
    return {
      path: place.path,
      params: { ...(place.params || {}) },
      search: { ...(place.search || {}) },
      hash: place.hash || '',
      href: `${location.pathname}${location.search}${location.hash}`,
      title: document.title || '',
      base,
      screens,
    }
  }

  function helloPayload(api) {
    if (!api) return null
    return {
      protocol: api.protocol ?? PROTOCOL,
      coreVersion: api.coreVersion ?? null,
      enabled: Boolean(api.isEnabled?.() ?? api.enabled),
    }
  }

  function normalizeGraph(graph) {
    const pulses = Array.isArray(graph?.pulses)
      ? graph.pulses
      : Array.isArray(graph?.nodes)
        ? graph.nodes
        : []
    return {
      ...graph,
      pulses,
      edges: Array.isArray(graph?.edges) ? graph.edges : [],
      updatedAt: graph?.updatedAt ?? Date.now(),
    }
  }

  async function handle(message) {
    const api = getApi()
    switch (message?.type) {
      case 'hello':
        return { hello: helloPayload(api) }
      case 'enable':
        api?.enable?.()
        return { hello: helloPayload(getApi()) }
      case 'getGraph': {
        const graph = normalizeGraph(api?.getGraph?.() ?? { pulses: [] })
        return { graph }
      }
      case 'getInspect': {
        if (typeof api?.getInspect === 'function') {
          const inspect = api.getInspect()
          if (inspect) return { inspect }
        }
        const graph = normalizeGraph(api?.getGraph?.() ?? { pulses: [] })
        return {
          inspect: {
            protocol: api?.protocol ?? PROTOCOL,
            coreVersion: api?.coreVersion ?? null,
            enabled: Boolean(api?.isEnabled?.()),
            updatedAt: graph.updatedAt,
            route: api?.getRoute?.() ?? readRouteFallback(),
            pulses: graph.pulses.map((pulse) => ({
              id: pulse.id,
              kind: pulse.kind,
              name: pulse.name,
              file: pulse.file,
              line: pulse.line,
              value: pulse.value,
              valuePreview: preview(pulse.value),
              stale: pulse.stale,
              disposed: pulse.disposed,
              subscribers: pulse.subscribers ?? 0,
              bindings: 0,
            })),
            edges: graph.edges,
            jcrFiles: [],
            meshBagCount: 0,
          },
        }
      }
      case 'getRoute':
        return { route: api?.getRoute?.() ?? readRouteFallback() }
      case 'getBindings':
        return { bindings: api?.getBindings?.(message.pulseId) ?? [] }
      case 'highlight':
        api?.highlight?.(message.pulseId)
        return { ok: true }
      case 'clearHighlight':
        api?.clearHighlight?.()
        return { ok: true }
      case 'flash':
        api?.flash?.(message.pulseId)
        return { ok: true }
      case 'pickElement':
        return (await api?.pickElement?.()) ?? { pulseIds: [] }
      default:
        return { ok: false, error: `Unknown message ${message?.type}` }
    }
  }

  function preview(value) {
    try {
      if (typeof value === 'string') return JSON.stringify(value)
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }

  window.addEventListener('message', (event) => {
    if (event.source !== window) return
    const data = event.data
    if (!data || data.source !== SOURCE_CONTENT || data.kind !== 'request') return
    Promise.resolve(handle(data.message))
      .then((payload) => reply(data.requestId, payload))
      .catch((error) =>
        reply(data.requestId, { ok: false, error: String(error?.message ?? error) }),
      )
  })

  window.postMessage(
    {
      source: SOURCE_PAGE,
      kind: 'ready',
      protocol: PROTOCOL,
    },
    '*',
  )
})()
