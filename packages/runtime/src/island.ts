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
  shadow?: boolean | ShadowRootMode
  clear?: boolean
  mark?: string | false
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

export function mountIsland(
  target: string | Element,
  app: IslandApp,
  options: MountIslandOptions = {},
): Cleanup {
  const host = resolveHost(target)
  const mount = resolveMount(app)
  const mountTarget = resolveMountTarget(host, options.shadow)
  const clear = options.clear !== false
  const mark = options.mark === false ? null : (options.mark ?? 'data-jacare-island')

  if (clear) {
    if (options.shadow) {
      host.replaceChildren()
      mountTarget.replaceChildren()
    } else {
      host.replaceChildren()
    }
  }

  const disposeMount = mount(mountTarget, options.props ?? {})

  if (mark) {
    host.setAttribute(mark, '')
  }

  let disposed = false
  return () => {
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
  }
}
