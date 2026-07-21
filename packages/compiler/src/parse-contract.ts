import { JacareCompileError } from './errors.js'

export type ContractTypeName = 'string' | 'number' | 'boolean' | 'object' | 'any'

export type ContractLinkMode = 'read' | 'write' | 'mirror'

export interface ContractPropDef {
  type: ContractTypeName
  required?: boolean
  default?: unknown
  model?: boolean
}

export interface ContractLinkDef {
  from: string
  mode: ContractLinkMode
}

export interface TemplateContract {
  props: Record<string, ContractPropDef>
  pulses: Record<string, ContractTypeName>
  slots: string[]
  emits: Record<string, Record<string, ContractTypeName>>
  forwards: string[]
  links: Record<string, ContractLinkDef>
}

const LINK_MODES = new Set<ContractLinkMode>(['read', 'write', 'mirror'])

const TYPE_NAMES = new Set<ContractTypeName>(['string', 'number', 'boolean', 'object', 'any'])

export function emptyContract(): TemplateContract {
  return {
    props: {},
    pulses: {},
    slots: [],
    emits: {},
    forwards: [],
    links: {},
  }
}

/** `cart.count` / `lab-cart.count` → bag id + published key. */
export function parseLinkFrom(from: string): { bag: string; key: string } {
  const match = from.match(/^([A-Za-z_$][\w$-]*)\.([A-Za-z_$][\w$]*)$/)
  if (!match) {
    throw new JacareCompileError(
      `Jacaré contract: link from must be "bag.key" (got ${JSON.stringify(from)})`,
    )
  }
  return { bag: match[1]!, key: match[2]! }
}

/** Stable mesh address `@cart/count`. */
export function linkAddress(from: string): string {
  const { bag, key } = parseLinkFrom(from)
  return `@${bag}/${key}`
}

export function contractLinkNames(contract: TemplateContract): string[] {
  return Object.keys(contract.links).sort()
}

export function parseContractBody(
  body: string,
  details: { filename?: string; line?: number; source?: string } = {},
): TemplateContract {
  const contract = emptyContract()
  const text = body.trim()
  if (!text) return contract

  let pos = 0
  while (pos < text.length) {
    pos = skipWsAndComments(text, pos)
    if (pos >= text.length) break

    const key = readIdent(text, pos)
    if (!key) {
      throw contractError(`expected contract field name`, details, pos, body)
    }
    pos = key.end
    pos = skipWsAndComments(text, pos)
    if (text[pos] !== ':') {
      throw contractError(`expected ':' after "${key.value}"`, details, pos, body)
    }
    pos++
    pos = skipWsAndComments(text, pos)

    if (key.value === 'props') {
      const parsed = readObject(text, pos, details, body)
      pos = parsed.end
      for (const [name, raw] of Object.entries(parsed.value)) {
        contract.props[name] = normalizePropDef(raw, name, details)
      }
    } else if (key.value === 'pulses') {
      const parsed = readObject(text, pos, details, body)
      pos = parsed.end
      for (const [name, raw] of Object.entries(parsed.value)) {
        contract.pulses[name] = normalizeTypeName(raw, name, details)
      }
    } else if (key.value === 'slots') {
      const parsed = readStringArray(text, pos, details, body)
      pos = parsed.end
      contract.slots = parsed.value
    } else if (key.value === 'emits') {
      if (text[pos] === '[') {
        const parsed = readStringArray(text, pos, details, body)
        pos = parsed.end
        for (const name of parsed.value) {
          contract.emits[name] = {}
        }
      } else {
        const parsed = readObject(text, pos, details, body)
        pos = parsed.end
        for (const [name, raw] of Object.entries(parsed.value)) {
          contract.emits[name] = normalizeEmitPayload(raw, name, details)
        }
      }
    } else if (key.value === 'forwards') {
      const parsed = readStringArray(text, pos, details, body)
      pos = parsed.end
      contract.forwards = parsed.value
    } else if (key.value === 'links') {
      const parsed = readObject(text, pos, details, body)
      pos = parsed.end
      for (const [name, raw] of Object.entries(parsed.value)) {
        if (contract.props[name] || contract.pulses[name]) {
          throw contractError(
            `link "${name}" clashes with props/pulses`,
            details,
            key.start,
            body,
          )
        }
        contract.links[name] = normalizeLinkDef(raw, name, details)
      }
    } else {
      throw contractError(`unknown contract field "${key.value}"`, details, key.start, body)
    }

    pos = skipWsAndComments(text, pos)
    if (text[pos] === ',' || text[pos] === ';') pos++
  }

  for (const name of Object.keys(contract.links)) {
    if (contract.props[name] || contract.pulses[name]) {
      throw contractError(`link "${name}" clashes with props/pulses`, details)
    }
  }

  return contract
}

export function contractPropNames(contract: TemplateContract): string[] {
  const names = new Set<string>([
    ...Object.keys(contract.props),
    ...Object.keys(contract.pulses),
  ])
  if (contract.slots.includes('default') || contract.slots.length === 0) {
    // children only when default slot is declared, or when slots omitted and template has slot — handled by caller
  }
  if (contract.slots.includes('default')) {
    names.add('children')
  }
  return [...names].sort()
}

export function hasContractSurface(contract: TemplateContract): boolean {
  return (
    Object.keys(contract.props).length > 0 ||
    Object.keys(contract.pulses).length > 0 ||
    contract.slots.length > 0 ||
    Object.keys(contract.emits).length > 0 ||
    contract.forwards.length > 0 ||
    Object.keys(contract.links).length > 0
  )
}

function normalizeLinkDef(
  raw: unknown,
  name: string,
  details: { filename?: string; line?: number; source?: string },
): ContractLinkDef {
  if (typeof raw === 'string') {
    parseLinkFrom(raw)
    return { from: raw, mode: 'read' }
  }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>
    const from = obj['from']
    if (typeof from !== 'string') {
      throw contractError(`link "${name}" requires from: 'bag.key'`, details)
    }
    parseLinkFrom(from)
    const modeRaw = obj['mode'] ?? 'read'
    if (typeof modeRaw !== 'string' || !LINK_MODES.has(modeRaw as ContractLinkMode)) {
      throw contractError(
        `link "${name}" mode must be read|write|mirror`,
        details,
      )
    }
    return { from, mode: modeRaw as ContractLinkMode }
  }
  throw contractError(`invalid link definition for "${name}"`, details)
}

function normalizePropDef(
  raw: unknown,
  name: string,
  details: { filename?: string; line?: number; source?: string },
): ContractPropDef {
  if (typeof raw === 'string') {
    return { type: asTypeName(raw, name, details) }
  }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>
    const typeRaw = obj['type'] ?? 'any'
    if (typeof typeRaw !== 'string') {
      throw contractError(`prop "${name}" type must be a string`, details)
    }
    const def: ContractPropDef = { type: asTypeName(typeRaw, name, details) }
    if (obj['required'] === true) def.required = true
    if (obj['model'] === true) def.model = true
    if ('default' in obj) def.default = obj['default']
    return def
  }
  throw contractError(`invalid prop definition for "${name}"`, details)
}

function normalizeTypeName(
  raw: unknown,
  name: string,
  details: { filename?: string; line?: number; source?: string },
): ContractTypeName {
  if (typeof raw !== 'string') {
    throw contractError(`pulse "${name}" type must be a string`, details)
  }
  return asTypeName(raw, name, details)
}

function normalizeEmitPayload(
  raw: unknown,
  name: string,
  details: { filename?: string; line?: number; source?: string },
): Record<string, ContractTypeName> {
  if (raw == null || (typeof raw === 'object' && !Array.isArray(raw) && Object.keys(raw as object).length === 0)) {
    return {}
  }
  if (typeof raw === 'string') {
    return { value: asTypeName(raw, name, details) }
  }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const out: Record<string, ContractTypeName> = {}
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof value !== 'string') {
        throw contractError(`emit "${name}.${key}" type must be a string`, details)
      }
      out[key] = asTypeName(value, `${name}.${key}`, details)
    }
    return out
  }
  throw contractError(`invalid emit definition for "${name}"`, details)
}

function asTypeName(
  value: string,
  label: string,
  details: { filename?: string; line?: number; source?: string },
): ContractTypeName {
  if (!TYPE_NAMES.has(value as ContractTypeName)) {
    throw contractError(
      `unknown type "${value}" for ${label} (expected string|number|boolean|object|any)`,
      details,
    )
  }
  return value as ContractTypeName
}

function readObject(
  text: string,
  start: number,
  details: { filename?: string; line?: number; source?: string },
  body: string,
): { value: Record<string, unknown>; end: number } {
  if (text[start] !== '{') {
    throw contractError(`expected '{'`, details, start, body)
  }
  let pos = start + 1
  const value: Record<string, unknown> = {}

  while (pos < text.length) {
    pos = skipWsAndComments(text, pos)
    if (text[pos] === '}') {
      return { value, end: pos + 1 }
    }
    const key = readIdent(text, pos) ?? readString(text, pos, details, body)
    if (!key) {
      throw contractError(`expected property name`, details, pos, body)
    }
    pos = key.end
    pos = skipWsAndComments(text, pos)
    if (text[pos] !== ':') {
      throw contractError(`expected ':' after "${key.value}"`, details, pos, body)
    }
    pos++
    pos = skipWsAndComments(text, pos)
    const entry = readValue(text, pos, details, body)
    value[key.value] = entry.value
    pos = entry.end
    pos = skipWsAndComments(text, pos)
    if (text[pos] === ',') pos++
  }

  throw contractError(`unclosed '{'`, details, start, body)
}

function readStringArray(
  text: string,
  start: number,
  details: { filename?: string; line?: number; source?: string },
  body: string,
): { value: string[]; end: number } {
  if (text[start] !== '[') {
    throw contractError(`expected '['`, details, start, body)
  }
  let pos = start + 1
  const value: string[] = []
  while (pos < text.length) {
    pos = skipWsAndComments(text, pos)
    if (text[pos] === ']') {
      return { value, end: pos + 1 }
    }
    const item = readString(text, pos, details, body)
    if (!item) {
      throw contractError(`expected string in array`, details, pos, body)
    }
    value.push(item.value)
    pos = item.end
    pos = skipWsAndComments(text, pos)
    if (text[pos] === ',') pos++
  }
  throw contractError(`unclosed '['`, details, start, body)
}

function readValue(
  text: string,
  start: number,
  details: { filename?: string; line?: number; source?: string },
  body: string,
): { value: unknown; end: number } {
  const ch = text[start]
  if (ch === '{') {
    return readObject(text, start, details, body)
  }
  if (ch === '[') {
    return readStringArray(text, start, details, body)
  }
  if (ch === "'" || ch === '"') {
    return readString(text, start, details, body)!
  }
  if (ch === 't' && text.startsWith('true', start)) {
    return { value: true, end: start + 4 }
  }
  if (ch === 'f' && text.startsWith('false', start)) {
    return { value: false, end: start + 5 }
  }
  if (ch === 'n' && text.startsWith('null', start)) {
    return { value: null, end: start + 4 }
  }
  if (ch === '-' || (ch !== undefined && /[0-9]/.test(ch))) {
    return readNumber(text, start, details, body)
  }
  throw contractError(`unexpected value`, details, start, body)
}

function readString(
  text: string,
  start: number,
  details: { filename?: string; line?: number; source?: string },
  body: string,
): { value: string; end: number } | null {
  const quote = text[start]
  if (quote !== "'" && quote !== '"') return null
  let pos = start + 1
  let value = ''
  while (pos < text.length) {
    const ch = text[pos]!
    if (ch === '\\' && pos + 1 < text.length) {
      value += text[pos + 1]!
      pos += 2
      continue
    }
    if (ch === quote) {
      return { value, end: pos + 1 }
    }
    value += ch
    pos++
  }
  throw contractError(`unclosed string`, details, start, body)
}

function readNumber(
  text: string,
  start: number,
  details: { filename?: string; line?: number; source?: string },
  body: string,
): { value: number; end: number } {
  let pos = start
  if (text[pos] === '-') pos++
  const numStart = pos
  while (pos < text.length && /[0-9.]/.test(text[pos]!)) pos++
  const raw = text.slice(start, pos)
  const value = Number(raw)
  if (!Number.isFinite(value) || pos === numStart) {
    throw contractError(`invalid number "${raw}"`, details, start, body)
  }
  return { value, end: pos }
}

function readIdent(text: string, start: number): { value: string; start: number; end: number } | null {
  if (!/[A-Za-z_$]/.test(text[start] ?? '')) return null
  let end = start + 1
  while (end < text.length && /[\w$]/.test(text[end]!)) end++
  return { value: text.slice(start, end), start, end }
}

function skipWsAndComments(text: string, start: number): number {
  let pos = start
  while (pos < text.length) {
    const ch = text[pos]!
    if (/\s/.test(ch)) {
      pos++
      continue
    }
    if (ch === '/' && text[pos + 1] === '/') {
      pos += 2
      while (pos < text.length && text[pos] !== '\n') pos++
      continue
    }
    if (ch === '/' && text[pos + 1] === '*') {
      pos += 2
      while (pos + 1 < text.length && !(text[pos] === '*' && text[pos + 1] === '/')) pos++
      pos = Math.min(pos + 2, text.length)
      continue
    }
    break
  }
  return pos
}

function contractError(
  message: string,
  details: { filename?: string; line?: number; source?: string },
  _pos?: number,
  _body?: string,
): JacareCompileError {
  return new JacareCompileError(`Jacaré contract: ${message}`, {
    ...(details.filename ? { filename: details.filename } : {}),
    ...(details.line !== undefined ? { line: details.line } : {}),
    ...(details.source ? { source: details.source } : {}),
  })
}
