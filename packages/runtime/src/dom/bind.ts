import { effect, runUntracked } from '../effect.js'
import type { ReadonlySignal } from '../types.js'

export { bindModel } from './bind-model.js'

export function bindText(node: Text, source: ReadonlySignal<string | number>): () => void {
  const update = (): void => {
    node.data = String(source())
  }
  runUntracked(update)
  return effect(update).dispose
}

export function bindPropText(
  node: Text,
  source: ReadonlySignal<string | number> | string | number | null | undefined,
): () => void {
  const read = (): string | number => {
    if (typeof source === 'function') return source()
    return source ?? ''
  }
  const update = (): void => {
    node.data = String(read())
  }
  runUntracked(update)
  return effect(update).dispose
}

export function bindAttribute(
  node: Element,
  name: string,
  source: ReadonlySignal<string | number | boolean | null | undefined>,
): () => void {
  const update = (): void => {
    const value = source()
    if (value === null || value === undefined || value === false) {
      node.removeAttribute(name)
      return
    }
    if (value === true) {
      node.setAttribute(name, '')
      return
    }
    node.setAttribute(name, String(value))
  }
  runUntracked(update)
  return effect(update).dispose
}

export function bindProperty<K extends keyof HTMLElement>(
  node: HTMLElement,
  name: K,
  source: ReadonlySignal<HTMLElement[K]>,
): () => void {
  const update = (): void => {
    node[name] = source()
  }
  runUntracked(update)
  return effect(update).dispose
}

export function bindClass(
  node: Element,
  className: string,
  source: ReadonlySignal<boolean>,
): () => void {
  const update = (): void => {
    node.classList.toggle(className, source())
  }
  runUntracked(update)
  return effect(update).dispose
}

export function bindStyleVar(
  node: HTMLElement,
  name: string,
  source: ReadonlySignal<string | number | boolean | null | undefined>,
): () => void {
  const update = (): void => {
    const value = source()
    if (value === null || value === undefined) {
      node.style.removeProperty(name)
      return
    }
    node.style.setProperty(name, String(value))
  }
  runUntracked(update)
  return effect(update).dispose
}
