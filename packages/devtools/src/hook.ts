import {
  clearHighlight,
  enableDevtools,
  flashDom,
  getBindingsForPulse,
  getMeshSnapshot,
  getPulseGraph,
  getPulsesForElement,
  getScopeSnapshot,
  highlightBinding,
  isDevtoolsEnabled,
  pickElement,
} from '@jacare/core'

const PROTOCOL = 3

export interface InstallPageHookOptions {
  coreVersion?: string | null
}

type WhereLike = (() => RoutePlace) & { peek?: RoutePlace }

type NavLike = {
  where: WhereLike
}

export interface RoutePlace {
  path: string
  params: Record<string, string>
  search: Record<string, string>
  hash: string
}

export interface RouteSnapshot {
  path: string
  params: Record<string, string>
  search: Record<string, string>
  hash: string
  href: string
  title: string
  base: string | null
  screens: string[]
}

export interface SerializedBinding {
  pulseId: number
  kind: string
  file?: string
  line?: number
  tag?: string
  id?: string
  className?: string
}

export interface SerializedPulse {
  id: number
  kind: string
  name?: string
  file?: string
  line?: number
  value: unknown
  valuePreview: string
  stale?: boolean
  disposed: boolean
  subscribers: number
  bindings: number
  /** True when the pulse is useful for everyday debugging (named, bound, or .jcr). */
  useful: boolean
}

export interface JcrFileGroup {
  file: string
  pulses: SerializedPulse[]
  bindingCount: number
}

export interface SerializedMeshCell {
  address: string
  bagId: string
  key: string
  kind: string
  value: unknown
  valuePreview: string
  pulseId?: number
  bindings: number
}

export interface SerializedMeshBag {
  id: string
  published: boolean
  cells: SerializedMeshCell[]
}

export interface SerializedScopeEntry {
  id: string
  label: string
  value: unknown
  valuePreview: string
}

export interface InspectSnapshot {
  protocol: number
  coreVersion: string | null
  enabled: boolean
  updatedAt: number
  route: RouteSnapshot | null
  pulses: SerializedPulse[]
  edges: { from: number; to: number }[]
  jcrFiles: JcrFileGroup[]
  mesh: SerializedMeshBag[]
  meshBagCount: number
  scope: SerializedScopeEntry[]
}

type GlobalWithJacare = typeof globalThis & {
  __JACARE_DEVTOOLS_HOOK__?: JacareDevtoolsHook
  __JACARE__?: Record<string, unknown>
  __JACARE_NAV__?: NavLike | { nav: NavLike; base?: string; screens?: string[] }
}

export interface JacareDevtoolsHook {
  protocol: number
  coreVersion: string | null
  enable: () => void
  isEnabled: () => boolean
  getGraph: () => ReturnType<typeof getPulseGraph>
  getBindings: (pulseId: number) => SerializedBinding[]
  getRoute: () => RouteSnapshot | null
  getInspect: () => InspectSnapshot
  highlight: (pulseId: number) => void
  clearHighlight: () => void
  flash: (pulseId: number) => void
  pickElement: () => Promise<{ pulseIds: number[] }>
}

function readPlace(nav: NavLike): RoutePlace | null {
  try {
    if (nav.where.peek) return nav.where.peek
    return nav.where()
  } catch {
    return null
  }
}

function resolveNav(): { nav: NavLike; base: string | null; screens: string[] } | null {
  const g = globalThis as GlobalWithJacare
  const raw = g.__JACARE_NAV__ as
    | NavLike
    | { nav: NavLike; base?: string; screens?: string[] }
    | undefined
  if (!raw || typeof raw !== 'object') return null
  if ('nav' in raw && raw.nav) {
    return {
      nav: raw.nav,
      base: raw.base ?? null,
      screens: Array.isArray(raw.screens) ? raw.screens : [],
    }
  }
  if ('where' in raw) {
    return { nav: raw as NavLike, base: null, screens: [] }
  }
  return null
}

function serializeValue(value: unknown, depth = 0): unknown {
  if (value == null) return value
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value
  if (typeof value === 'bigint') return `${value}n`
  if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`
  if (typeof value === 'symbol') return value.toString()
  if (depth > 4) return '[…]'
  if (typeof Node !== 'undefined' && value instanceof Node) {
    if (value.nodeType === Node.ELEMENT_NODE) {
      const el = value as Element
      return `<${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}>`
    }
    return `[Node ${value.nodeName}]`
  }
  if (Array.isArray(value)) {
    return value.slice(0, 40).map((item) => serializeValue(item, depth + 1))
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {}
    let count = 0
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (count++ >= 40) {
        out['…'] = 'truncated'
        break
      }
      out[key] = serializeValue(item, depth + 1)
    }
    return out
  }
  return String(value)
}

function previewValue(value: unknown): string {
  try {
    const serialized = serializeValue(value)
    if (typeof serialized === 'string') return JSON.stringify(serialized)
    return JSON.stringify(serialized)
  } catch {
    return String(value)
  }
}

function serializeBinding(binding: {
  pulseId: number
  target: Node
  kind: string
  file?: string
  line?: number
}): SerializedBinding {
  const el =
    binding.target.nodeType === Node.ELEMENT_NODE
      ? (binding.target as Element)
      : binding.target.parentElement
  return {
    pulseId: binding.pulseId,
    kind: binding.kind,
    ...(binding.file ? { file: binding.file } : {}),
    ...(binding.line != null ? { line: binding.line } : {}),
    ...(el
      ? {
          tag: el.tagName.toLowerCase(),
          ...(el.id ? { id: el.id } : {}),
          ...(typeof el.className === 'string' && el.className
            ? { className: el.className }
            : {}),
        }
      : {}),
  }
}

function isUsefulPulse(pulse: {
  disposed: boolean
  name?: string
  file?: string
  bindings: number
  kind: string
}): boolean {
  if (pulse.disposed) return false
  if (pulse.name) return true
  if (pulse.bindings > 0) return true
  if (pulse.file && /\.jcr(?:\?|$)/i.test(pulse.file)) return true
  if (pulse.kind === 'signal') return true
  return false
}

function shortFile(file: string): string {
  const jcr = file.match(/([^/\\]+\.jcr)(?:\?.*)?$/i)
  if (jcr?.[1]) return jcr[1]
  const parts = file.split(/[/\\]/)
  return parts[parts.length - 1] ?? file
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
      return getBindingsForPulse(pulseId).map(serializeBinding)
    },
    getRoute() {
      const resolved = resolveNav()
      if (!resolved) {
        if (typeof location === 'undefined') return null
        return {
          path: location.pathname,
          params: {},
          search: Object.fromEntries(new URLSearchParams(location.search)),
          hash: location.hash,
          href: `${location.pathname}${location.search}${location.hash}`,
          title: typeof document !== 'undefined' ? document.title : '',
          base: null,
          screens: [],
        }
      }
      const place = readPlace(resolved.nav)
      if (!place) return null
      const href =
        typeof location !== 'undefined'
          ? `${location.pathname}${location.search}${location.hash}`
          : place.path
      return {
        path: place.path,
        params: { ...place.params },
        search: { ...place.search },
        hash: place.hash ?? '',
        href,
        title: typeof document !== 'undefined' ? document.title : '',
        base: resolved.base,
        screens: resolved.screens,
      }
    },
    getInspect() {
      const graph = getPulseGraph()
      const nodes = graph.nodes ?? []
      const pulses: SerializedPulse[] = nodes.map((node) => {
        const bindings = getBindingsForPulse(node.id)
        const base = {
          id: node.id,
          kind: node.kind,
          ...(node.name ? { name: node.name } : {}),
          ...(node.file ? { file: node.file } : {}),
          ...(node.line != null ? { line: node.line } : {}),
          value: serializeValue(node.value),
          valuePreview: previewValue(node.value),
          ...(node.stale !== undefined ? { stale: node.stale } : {}),
          disposed: node.disposed,
          subscribers: node.subscribers,
          bindings: bindings.length,
        }
        return {
          ...base,
          useful: isUsefulPulse(base),
        }
      })

      const byFile = new Map<string, JcrFileGroup>()
      for (const pulse of pulses) {
        if (!pulse.file || !/\.jcr(?:\?|$)/i.test(pulse.file)) continue
        const file = shortFile(pulse.file)
        let group = byFile.get(file)
        if (!group) {
          group = { file, pulses: [], bindingCount: 0 }
          byFile.set(file, group)
        }
        group.pulses.push(pulse)
        group.bindingCount += pulse.bindings
      }

      for (const pulse of pulses) {
        for (const binding of getBindingsForPulse(pulse.id)) {
          if (!binding.file || !/\.jcr(?:\?|$)/i.test(binding.file)) continue
          const file = shortFile(binding.file)
          let group = byFile.get(file)
          if (!group) {
            group = { file, pulses: [], bindingCount: 0 }
            byFile.set(file, group)
          }
          if (!group.pulses.some((p) => p.id === pulse.id)) {
            group.pulses.push(pulse)
          }
          group.bindingCount += 1
        }
      }

      const jcrFiles = [...byFile.values()].sort((a, b) => a.file.localeCompare(b.file))

      let mesh: SerializedMeshBag[] = []
      try {
        const snap = getMeshSnapshot()
        mesh = (snap?.bags ?? []).map((bag) => ({
          id: bag.id,
          published: bag.published,
          cells: (bag.cells ?? []).map((cell) => ({
            address: cell.address,
            bagId: cell.bagId,
            key: cell.key,
            kind: cell.kind,
            value: serializeValue(cell.value),
            valuePreview: previewValue(cell.value),
            ...(cell.pulseId != null ? { pulseId: cell.pulseId } : {}),
            bindings: cell.bindings ?? 0,
          })),
        }))
      } catch {
        mesh = []
      }

      let scope: SerializedScopeEntry[] = []
      try {
        scope = (getScopeSnapshot()?.entries ?? []).map((entry) => ({
          id: entry.id,
          label: entry.label,
          value: serializeValue(entry.value),
          valuePreview: previewValue(entry.value),
        }))
      } catch {
        scope = []
      }

      return {
        protocol: PROTOCOL,
        coreVersion: version,
        enabled: isDevtoolsEnabled(),
        updatedAt: graph.updatedAt ?? Date.now(),
        route: hook.getRoute(),
        pulses,
        edges: graph.edges ?? [],
        jcrFiles,
        mesh,
        meshBagCount: mesh.length,
        scope,
      }
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
    getMeshSnapshot,
    getScopeSnapshot,
  }

  return () => {
    if (g.__JACARE_DEVTOOLS_HOOK__ === hook) {
      delete g.__JACARE_DEVTOOLS_HOOK__
    }
  }
}
