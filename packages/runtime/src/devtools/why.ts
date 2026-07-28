import type { ReadonlySignal } from '../types.js'
import {
  getBindingsForPulse,
  getLastWritePulseId,
  getPulseGraph,
  getPulsesForElement,
  getWrites,
  isDevtoolsEnabled,
  resolvePulseId,
} from './registry.js'
import type { BindingKind, PulseBinding, PulseNode } from './types.js'
import type { WriteRecord } from './ledger.js'

export interface WhyPulseRef {
  id: number
  name?: string
  file?: string
  line?: number
}

export interface WhyWriteSite {
  fn?: string
  file?: string
  line?: number
}

export interface WhyWrite {
  value: unknown
  prev: unknown
  at: number
  site?: WhyWriteSite
  ripple?: number
}

export interface WhyChain {
  target: { kind: 'element' | 'pulse' | 'error'; label: string }
  binding?: {
    kind: BindingKind
    file?: string
    line?: number
    expr?: string
  }
  pulse?: {
    id: number
    name: string
    file?: string
    line?: number
    value: unknown
    deps: WhyPulseRef[]
  }
  lastWrites: WhyWrite[]
  owner?: { screen?: string; alive: boolean }
}

export function why(
  target: Element | Node | ReadonlySignal<unknown> | string | number,
): WhyChain {
  const resolved = resolveTarget(target)
  if (!resolved) {
    return {
      target: { kind: 'pulse', label: String(target) },
      lastWrites: [],
    }
  }

  const { pulseId, label, kind, binding } = resolved
  const graph = getPulseGraph()
  const node = graph.nodes.find((n) => n.id === pulseId)
  const deps = graph.edges
    .filter((e) => e.to === pulseId)
    .map((e) => graph.nodes.find((n) => n.id === e.from))
    .filter((n): n is PulseNode => n != null)
    .map((n) => toPulseRef(n))

  const writes = getWrites(pulseId).map(toWhyWrite).reverse()
  const primary =
    binding ??
    getBindingsForPulse(pulseId)[0]

  return {
    target: { kind, label },
    ...(primary
      ? {
          binding: {
            kind: primary.kind,
            ...(primary.file ? { file: primary.file } : {}),
            ...(primary.line != null ? { line: primary.line } : {}),
            ...(primary.expr ? { expr: primary.expr } : {}),
          },
        }
      : {}),
    ...(node
      ? {
          pulse: {
            id: node.id,
            name: node.name ?? `Pulse #${node.id}`,
            ...(node.file ? { file: node.file } : {}),
            ...(node.line != null ? { line: node.line } : {}),
            value: node.value,
            deps,
          },
        }
      : {}),
    lastWrites: writes,
    owner: { alive: node ? !node.disposed : false },
  }
}

export function whyLast(): WhyChain | null {
  const id = getLastWritePulseId()
  if (id == null) return null
  return why(id)
}

export function formatWhyChain(chain: WhyChain): string {
  const lines: string[] = [`why ${chain.target.label} ?`, '│']

  if (chain.binding) {
    const loc = formatLoc(chain.binding.file, chain.binding.line)
    const expr = chain.binding.expr ? `   ${chain.binding.expr}` : ''
    lines.push(`├─ bind ${chain.binding.kind}${loc ? `   ${loc}` : ''}${expr}`)
    lines.push('│')
  }

  if (chain.pulse) {
    const loc = formatLoc(chain.pulse.file, chain.pulse.line)
    lines.push(
      `├─ pulse ${chain.pulse.name} = ${preview(chain.pulse.value)}${loc ? `      ${loc}` : ''}`,
    )
    if (chain.pulse.deps.length === 0) {
      lines.push('│     └─ deps: none (root cell)')
    } else {
      const deps = chain.pulse.deps
        .map((d) => d.name ?? `#${d.id}`)
        .join(', ')
      lines.push(`│     └─ deps: ${deps}`)
    }
    lines.push('│')
  }

  if (chain.lastWrites.length > 0) {
    const w = chain.lastWrites[0]!
    const ago = formatAgo(w.at)
    lines.push(`├─ last write: ${preview(w.value)}  (${ago})`)
    if (w.site) {
      const siteBits = [
        w.site.fn,
        formatLoc(w.site.file, w.site.line),
      ].filter(Boolean)
      if (siteBits.length) lines.push(`│     ${siteBits.join('  ')}`)
    }
    lines.push(`│     previous value: ${preview(w.prev)}`)
    lines.push('│')
  } else {
    lines.push('├─ last write: — (no ledger; enable DevTools before sets)')
    lines.push('│')
  }

  const alive = chain.owner?.alive !== false ? 'alive' : 'disposed'
  const screen = chain.owner?.screen ? ` · owner: ${chain.owner.screen}` : ''
  lines.push(`└─ dispose: ${alive}${screen}`)

  return lines.join('\n')
}

function resolveTarget(
  target: Element | Node | ReadonlySignal<unknown> | string | number,
): {
  pulseId: number
  label: string
  kind: 'element' | 'pulse'
  binding?: PulseBinding
} | null {
  if (typeof target === 'number') {
    const graph = getPulseGraph()
    const node = graph.nodes.find((n) => n.id === target)
    if (!node && !isDevtoolsEnabled()) return null
    return {
      pulseId: target,
      label: node?.name ?? `Pulse #${target}`,
      kind: 'pulse',
    }
  }

  if (typeof target === 'string') {
    const trimmed = target.trim()
    const graph = getPulseGraph()
    // Mesh cells are named `@bag/key` via namePulse — resolve by graph name.
    const node = graph.nodes.find((n) => n.name === trimmed)
    if (node) return { pulseId: node.id, label: trimmed, kind: 'pulse' }
    return null
  }

  if (typeof target === 'function' || (typeof target === 'object' && target !== null && !isDomNode(target))) {
    const id = resolvePulseId(target)
    if (id == null) return null
    const graph = getPulseGraph()
    const node = graph.nodes.find((n) => n.id === id)
    return {
      pulseId: id,
      label: node?.name ?? `Pulse #${id}`,
      kind: 'pulse',
    }
  }

  if (isDomNode(target)) {
    const el =
      target.nodeType === Node.ELEMENT_NODE
        ? (target as Element)
        : target.parentElement
    if (!el) return null
    const ids = getPulsesForElement(el)
    const pulseId = ids[0]
    if (pulseId == null) {
      return null
    }
    const bindings = getBindingsForPulse(pulseId)
    const binding =
      bindings.find((b) => {
        const host =
          b.target.nodeType === Node.ELEMENT_NODE
            ? (b.target as Element)
            : b.target.parentElement
        return host === el || (host != null && (el.contains(host) || host.contains(el)))
      }) ?? bindings[0]
    const tag =
      el instanceof HTMLElement
        ? `<${el.tagName.toLowerCase()}${el.className ? ` class="${String(el.className).trim()}"` : ''}>`
        : el.nodeName
    return {
      pulseId,
      label: tag,
      kind: 'element',
      ...(binding ? { binding } : {}),
    }
  }

  return null
}

function isDomNode(value: unknown): value is Node {
  return typeof Node !== 'undefined' && value instanceof Node
}

function toPulseRef(node: PulseNode): WhyPulseRef {
  return {
    id: node.id,
    ...(node.name ? { name: node.name } : {}),
    ...(node.file ? { file: node.file } : {}),
    ...(node.line != null ? { line: node.line } : {}),
  }
}

function toWhyWrite(record: WriteRecord): WhyWrite {
  const site = record.stack ? parseStackSite(record.stack) : undefined
  return {
    value: record.value,
    prev: record.prev,
    at: record.at,
    ...(site ? { site } : {}),
  }
}

/** Skip frames inside Jacaré runtime / ledger when attributing a write site. */
function parseStackSite(stack: string): WhyWriteSite | undefined {
  const lines = stack.split('\n').map((l) => l.trim()).filter(Boolean)
  for (const line of lines) {
    if (/Error|recordWrite|ledger|signal\.ts|registry\.ts|why\.ts/i.test(line)) continue
    const chrome = /at\s+(?:(.+?)\s+\()?((?:https?:\/\/|file:\/\/|\/)[^:)]+):(\d+):(\d+)/.exec(line)
    if (chrome) {
      const fn = chrome[1]?.trim()
      const file = chrome[2]
      const lineNo = Number(chrome[3])
      if (file && /node_modules|@jacare\/|\/devtools\//.test(file)) continue
      return {
        ...(fn && fn !== 'Object.<anonymous>' ? { fn } : {}),
        ...(file ? { file: shortenPath(file) } : {}),
        ...(Number.isFinite(lineNo) ? { line: lineNo } : {}),
      }
    }
    const plain = /([^/\s(]+\.[a-z]+):(\d+):(\d+)/i.exec(line)
    if (plain) {
      const file = plain[1]
      const lineNo = Number(plain[2])
      if (!file || !Number.isFinite(lineNo)) continue
      return { file, line: lineNo }
    }
  }
  return undefined
}

function shortenPath(path: string): string {
  try {
    const u = path.includes('://') ? new URL(path) : null
    const p = u ? u.pathname : path
    const parts = p.replace(/\\/g, '/').split('/')
    return parts.slice(-2).join('/')
  } catch {
    return path
  }
}

function formatLoc(file?: string, line?: number): string {
  if (!file) return ''
  const base = file.replace(/\\/g, '/').split('/').pop() || file
  return line != null ? `${base}:${line}` : base
}

function preview(value: unknown): string {
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return JSON.stringify(value)
  try {
    const text = JSON.stringify(value)
    if (text == null) return String(value)
    return text.length > 60 ? `${text.slice(0, 59)}…` : text
  } catch {
    return String(value)
  }
}

function formatAgo(at: number): string {
  const ms = Date.now() - at
  if (ms < 1000) return `${ms}ms ago`
  const s = ms / 1000
  if (s < 60) return `${s.toFixed(1)}s ago`
  return `${(s / 60).toFixed(1)}min ago`
}
