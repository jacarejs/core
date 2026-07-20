import { effect, runUntracked } from '../effect.js'

function readDebugValue(raw: unknown): unknown {
  if (typeof raw === 'function') {
    const fn = raw as { subscribe?: unknown; peek?: unknown }
    if (typeof fn.subscribe === 'function' && 'peek' in fn) {
      return fn.peek
    }
    try {
      return (raw as () => unknown)()
    } catch {
      return raw
    }
  }
  return raw
}

export function formatDebugValue(value: unknown): string {
  const seen = new WeakSet<object>()
  return JSON.stringify(
    readDebugValue(value),
    (_key, val) => {
      if (typeof val === 'function') return '[Function]'
      if (typeof val === 'bigint') return val.toString()
      if (val && typeof val === 'object') {
        if (seen.has(val)) return '[Circular]'
        seen.add(val)
        if (val instanceof Map) return Object.fromEntries(val)
        if (val instanceof Set) return [...val]
      }
      return val
    },
    2,
  )
}

export interface BindDebugOptions {
  label?: string
  copy?: boolean
}

export function bindDebug(
  host: HTMLElement,
  read: () => unknown,
  options: BindDebugOptions = {},
): () => void {
  host.className = 'jacare-debug'
  host.setAttribute('data-jacare-debug', '')

  let head: HTMLDivElement | null = null
  let labelEl: HTMLSpanElement | null = null
  let copyBtn: HTMLButtonElement | null = null
  const pre = document.createElement('pre')
  pre.className = 'jacare-debug-body'

  if (options.label || options.copy) {
    head = document.createElement('div')
    head.className = 'jacare-debug-head'
    if (options.label) {
      labelEl = document.createElement('span')
      labelEl.className = 'jacare-debug-label'
      labelEl.textContent = options.label
      head.appendChild(labelEl)
    }
    if (options.copy) {
      copyBtn = document.createElement('button')
      copyBtn.type = 'button'
      copyBtn.className = 'jacare-debug-copy btn btn-ghost'
      copyBtn.textContent = 'Copy JSON'
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(pre.textContent ?? '')
          copyBtn!.textContent = 'Copied'
          setTimeout(() => {
            copyBtn!.textContent = 'Copy JSON'
          }, 1200)
        } catch {
          copyBtn!.textContent = 'Copy failed'
        }
      })
      head.appendChild(copyBtn)
    }
    host.appendChild(head)
  }

  host.appendChild(pre)

  const update = (): void => {
    pre.textContent = formatDebugValue(read())
  }

  runUntracked(update)
  return effect(update).dispose
}
