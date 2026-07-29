import { signal } from './signal.js'
import type { Signal } from './types.js'

export type Cleanup = () => void

export type IslandMount = (
  target: ParentNode,
  props?: Record<string, unknown>,
) => Cleanup

export type IslandApp =
  | IslandMount
  | { mount: IslandMount; default?: IslandMount }
  | { default: IslandMount; mount?: IslandMount }

export type MountIslandOptions = {
  props?: Record<string, unknown>
  /**
   * When true (default), plain prop values become pulses so the host can call
   * `dispose.update(next)` without remounting. Callback props and existing pulses
   * are passed through. Set `false` for a one-shot plain-object mount.
   */
  live?: boolean
  shadow?: boolean | ShadowRootMode
  clear?: boolean
  mark?: string | false
}

/** Dispose the island; call `.update(props)` to push new values into live prop pulses. */
export type IslandDispose = Cleanup & {
  update: (next: Record<string, unknown>) => void
}

const ISLAND_ROOT = 'data-jacare-island-root'

function resolveHost(target: string | Element): Element {
  if (typeof target === 'string') {
    const el = document.querySelector(target)
    if (!el) {
      throw new Error(
        `@jacare/core/island: no element matches ${JSON.stringify(target)}`,
      )
    }
    return el
  }
  if (!(target instanceof Element)) {
    throw new Error('@jacare/core/island: target must be a selector string or Element')
  }
  return target
}

function resolveMount(app: IslandApp): IslandMount {
  if (typeof app === 'function') return app
  if (app && typeof app === 'object') {
    if (typeof app.mount === 'function') return app.mount
    if (typeof app.default === 'function') return app.default
  }
  throw new Error(
    '@jacare/core/island: expected a mount function or a module with mount/default',
  )
}

function resolveMountTarget(
  host: Element,
  shadow: boolean | ShadowRootMode | undefined,
): Element {
  if (!shadow) return host
  const mode: ShadowRootMode = shadow === true ? 'open' : shadow
  const root = host.shadowRoot ?? host.attachShadow({ mode })
  let wrap = root.querySelector(`:scope > [${ISLAND_ROOT}]`) as HTMLElement | null
  if (!wrap) {
    wrap = document.createElement('div')
    wrap.setAttribute(ISLAND_ROOT, '')
    root.appendChild(wrap)
  }
  return wrap
}

function isPulseLike(value: unknown): value is Signal<unknown> {
  return (
    typeof value === 'function' &&
    value !== null &&
    typeof (value as Signal<unknown>).set === 'function'
  )
}

function createLiveProps(initial: Record<string, unknown>): {
  props: Record<string, unknown>
  update: (next: Record<string, unknown>) => void
} {
  const cells = new Map<string, Signal<unknown>>()
  const props: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(initial)) {
    if (isPulseLike(value) || typeof value === 'function') {
      props[key] = value
      continue
    }
    const cell = signal(value)
    cells.set(key, cell)
    props[key] = cell
  }

  return {
    props,
    update(next) {
      for (const [key, value] of Object.entries(next)) {
        const cell = cells.get(key)
        if (!cell) continue
        if (typeof value === 'function' && !isPulseLike(value)) continue
        cell.set(isPulseLike(value) ? value() : value)
      }
    },
  }
}

export function mountIsland(
  target: string | Element,
  app: IslandApp,
  options: MountIslandOptions = {},
): IslandDispose {
  const host = resolveHost(target)
  const mount = resolveMount(app)
  const mountTarget = resolveMountTarget(host, options.shadow)
  const clear = options.clear !== false
  const mark = options.mark === false ? null : (options.mark ?? 'data-jacare-island')
  const live = options.live !== false
  const initialProps = options.props ?? {}
  const liveProps = live ? createLiveProps(initialProps) : null
  const mountProps = liveProps?.props ?? initialProps

  if (clear) {
    if (options.shadow) {
      host.replaceChildren()
      mountTarget.replaceChildren()
    } else {
      host.replaceChildren()
    }
  }

  const disposeMount = mount(mountTarget, mountProps)

  if (mark) {
    host.setAttribute(mark, '')
  }

  let disposed = false
  const dispose = (() => {
    if (disposed) return
    disposed = true
    disposeMount()
    if (mark) host.removeAttribute(mark)
    if (clear) {
      if (options.shadow) {
        host.replaceChildren()
        mountTarget.replaceChildren()
      } else {
        host.replaceChildren()
      }
    }
  }) as IslandDispose

  dispose.update = (next) => {
    if (disposed) return
    if (!liveProps) {
      throw new Error(
        '@jacare/core/island: update() requires live props (default). Pass live: true or omit live.',
      )
    }
    liveProps.update(next)
  }

  return dispose
}
