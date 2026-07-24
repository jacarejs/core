;(function installJacareDevtoolsPageHook() {
  const SOURCE_PAGE = 'jacare-devtools-page'
  const SOURCE_CONTENT = 'jacare-devtools-content'
  const PROTOCOL = 1

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
        getGraph: () => core.getPulseGraph?.() ?? { pulses: [] },
        getBindings: (pulseId) => core.getBindingsForPulse?.(pulseId) ?? [],
        highlight: (pulseId) => core.highlightBinding?.(pulseId),
        clearHighlight: () => core.clearHighlight?.(),
        flash: (pulseId) => {
          const bindings = core.getBindingsForPulse?.(pulseId) ?? []
          const first = bindings[0]
          if (first?.node) core.flashDom?.(first.node)
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

  function helloPayload(api) {
    if (!api) return null
    return {
      protocol: api.protocol ?? PROTOCOL,
      coreVersion: api.coreVersion ?? null,
      enabled: Boolean(api.isEnabled?.() ?? api.enabled),
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
        const graph = api?.getGraph?.() ?? { pulses: [] }
        const pulses = Array.isArray(graph.pulses)
          ? graph.pulses
          : Array.isArray(graph.nodes)
            ? graph.nodes
            : []
        return { graph: { ...graph, pulses } }
      }
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
