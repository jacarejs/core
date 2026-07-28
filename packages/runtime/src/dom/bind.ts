import { effect } from '../effect.js'
import type { ReadonlySignal } from '../types.js'

export { bindModel } from './bind-model.js'

const UNSET = Symbol('bind-unset')

function readText(
  source: ReadonlySignal<string | number> | string | number | null | undefined,
): string {
  if (typeof source === 'function') return String(source() ?? '')
  return String(source ?? '')
}

/** One write on mount (effect runs once). Skip DOM when value is unchanged. */
export function bindText(
  node: Text,
  source: ReadonlySignal<string | number> | string | number | null | undefined,
): () => void {
  let last: string | undefined
  const update = (): void => {
    const next = readText(source)
    if (next === last) return
    last = next
    node.data = next
  }
  return effect(update).dispose
}

export function bindPropText(
  node: Text,
  source: ReadonlySignal<string | number> | string | number | null | undefined,
): () => void {
  return bindText(node, source)
}

export function bindAttribute(
  node: Element,
  name: string,
  source: ReadonlySignal<string | number | boolean | null | undefined>,
): () => void {
  let last: string | false | null | undefined
  const update = (): void => {
    const value = source()
    if (value === null || value === undefined || value === false) {
      if (last === false || last === null) return
      last = value === false ? false : null
      node.removeAttribute(name)
      return
    }
    if (value === true) {
      if (last === '') return
      last = ''
      node.setAttribute(name, '')
      return
    }
    const text = String(value)
    if (text === last) return
    last = text
    node.setAttribute(name, text)
  }
  return effect(update).dispose
}

export function bindProperty<K extends keyof HTMLElement>(
  node: HTMLElement,
  name: K,
  source: ReadonlySignal<HTMLElement[K]>,
): () => void {
  let last: HTMLElement[K] | typeof UNSET = UNSET
  const update = (): void => {
    const next = source()
    if (Object.is(next, last)) return
    last = next
    node[name] = next
  }
  return effect(update).dispose
}

export function bindClass(
  node: Element,
  className: string,
  source: ReadonlySignal<boolean>,
): () => void {
  let last: boolean | undefined
  const update = (): void => {
    const next = !!source()
    if (next === last) return
    last = next
    node.classList.toggle(className, next)
  }
  return effect(update).dispose
}

export function bindStyleVar(
  node: HTMLElement,
  name: string,
  source: ReadonlySignal<string | number | boolean | null | undefined>,
): () => void {
  let last: string | null | undefined
  const update = (): void => {
    const value = source()
    if (value === null || value === undefined) {
      if (last === null) return
      last = null
      node.style.removeProperty(name)
      return
    }
    const text = String(value)
    if (text === last) return
    last = text
    node.style.setProperty(name, text)
  }
  return effect(update).dispose
}
