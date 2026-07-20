import { bindText } from '../dom/bind.js'
import type { ReadonlySignal } from '../types.js'

export interface SSRBinding {
  id: string
  kind: 'signal' | 'expr'
  read?: ReadonlySignal<string | number> | (() => string | number)
  expr?: string
}

export interface SSRState {
  bindings: SSRBinding[]
}

export interface SSRResult {
  html: string
  state: SSRState
}

export function resumeBindings(target: ParentNode, state: SSRState): Array<() => void> {
  const cleanups: Array<() => void> = []

  for (const binding of state.bindings) {
    const host = target.querySelector(`[data-jacare-bind="${binding.id}"]`)
    if (!host || !binding.read) continue

    const text = findTextNode(host)
    cleanups.push(bindText(text, coerceBindingRead(binding)))
  }

  return cleanups
}

function coerceBindingRead(binding: SSRBinding): ReadonlySignal<string | number> {
  const read = binding.read!
  if (binding.kind === 'signal') {
    return read as ReadonlySignal<string | number>
  }

  return (() => {
    const value = (read as () => unknown)()
    return typeof value === 'function'
      ? (value as () => string | number)()
      : (value as string | number)
  }) as ReadonlySignal<string | number>
}

function findTextNode(host: Element): Text {
  for (const node of host.childNodes) {
    if (node instanceof Text) return node
  }
  const text = document.createTextNode(host.textContent ?? '')
  host.replaceChildren(text)
  return text
}

export function renderToString(renderFn: (props?: Record<string, unknown>) => SSRResult, props?: Record<string, unknown>): string {
  return renderFn(props).html
}

export async function* renderToStream(
  renderFn: (props?: Record<string, unknown>) => SSRResult,
  props?: Record<string, unknown>,
): AsyncGenerator<string> {
  const { html } = renderFn(props)
  const chunks = splitTopLevelHtml(html)
  for (const chunk of chunks) {
    yield chunk
  }
}

function splitTopLevelHtml(html: string): string[] {
  const trimmed = html.trim()
  if (!trimmed) return []

  const chunks: string[] = []
  let index = 0

  while (index < trimmed.length) {
    while (index < trimmed.length && /\s/.test(trimmed[index]!)) {
      index++
    }
    if (index >= trimmed.length) break

    const start = index

    if (trimmed[index] !== '<') {
      const nextTag = trimmed.indexOf('<', index)
      const end = nextTag === -1 ? trimmed.length : nextTag
      chunks.push(trimmed.slice(start, end))
      index = end
      continue
    }

    const open = /^<([A-Za-z][\w-]*)(\s[^>]*)?>/.exec(trimmed.slice(index))
    if (!open) {
      chunks.push(trimmed.slice(start))
      break
    }

    const tag = open[1]!
    const openLength = open[0].length

    if (open[0].endsWith('/>') || VOID_TAGS.has(tag.toLowerCase())) {
      chunks.push(trimmed.slice(start, index + openLength))
      index += openLength
      continue
    }

    const close = `</${tag}>`
    let depth = 1
    let cursor = index + openLength

    while (cursor < trimmed.length && depth > 0) {
      const nextOpen = trimmed.indexOf(`<${tag}`, cursor)
      const nextClose = trimmed.indexOf(close, cursor)
      if (nextClose === -1) {
        chunks.push(trimmed.slice(start))
        return chunks
      }

      if (nextOpen !== -1 && nextOpen < nextClose) {
        const nestedOpen = /^<([A-Za-z][\w-]*)(\s[^>]*)?>/.exec(trimmed.slice(nextOpen))
        if (nestedOpen?.[1] === tag && !nestedOpen[0].endsWith('/>')) {
          depth++
        }
        cursor = nextOpen + (nestedOpen?.[0].length ?? 1)
        continue
      }

      depth--
      cursor = nextClose + close.length
    }

    chunks.push(trimmed.slice(start, cursor))
    index = cursor
  }

  return chunks.length > 0 ? chunks : [trimmed]
}

const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
