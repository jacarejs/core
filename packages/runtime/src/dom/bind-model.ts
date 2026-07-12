import { effect, runUntracked } from '../effect.js'
import type { Signal } from '../types.js'

type ModelProperty = 'value' | 'checked'

function modelEvent(node: HTMLElement, prop: ModelProperty): string {
  if (prop === 'checked') return 'change'
  if (node instanceof HTMLSelectElement) return 'change'
  if (node instanceof HTMLInputElement) {
    const type = node.type
    if (type === 'checkbox' || type === 'radio' || type === 'file') return 'change'
  }
  return 'input'
}

function readModelValue(node: HTMLElement, prop: ModelProperty): string | boolean {
  if (prop === 'checked') {
    return (node as HTMLInputElement).checked
  }
  return (node as HTMLInputElement).value
}

function writeModelValue(
  node: HTMLElement,
  prop: ModelProperty,
  value: string | number | boolean,
): void {
  if (prop === 'checked') {
    ;(node as HTMLInputElement).checked = Boolean(value)
    return
  }
  ;(node as HTMLInputElement).value = String(value)
}

export function bindModel(
  node: HTMLElement,
  prop: ModelProperty,
  source: Signal<string | number | boolean>,
): () => void {
  const cleanups: Array<() => void> = []

  const update = (): void => {
    const next = source()
    const current = readModelValue(node, prop)
    if (prop === 'checked') {
      if (current === next) return
    } else if (String(current) === String(next)) {
      return
    }
    writeModelValue(node, prop, next)
  }
  runUntracked(update)
  cleanups.push(effect(update).dispose)

  const eventName = modelEvent(node, prop)
  const handler = (): void => {
    const next = readModelValue(node, prop)
    if (prop === 'checked') {
      source.set(next as boolean)
      return
    }
    source.set(next as string)
  }

  node.addEventListener(eventName, handler)
  cleanups.push(() => node.removeEventListener(eventName, handler))

  if (prop === 'value') {
    const onChange = (): void => {
      source.set(readModelValue(node, prop) as string)
    }
    node.addEventListener('change', onChange)
    cleanups.push(() => node.removeEventListener('change', onChange))
  }

  return () => {
    for (const cleanup of cleanups) cleanup()
  }
}
