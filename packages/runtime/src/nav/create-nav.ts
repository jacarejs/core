import { effect } from '../effect.js'
import { signal } from '../signal.js'
import { isLoader } from './lazy.js'
import { screen, applyScreenTitle, type ScreenModule } from './screen.js'
import {
  buildPath,
  matchScreen,
  normalizePath,
  normalizeScreens,
  parseSearch,
} from './match.js'
import type {
  Nav,
  NavContext,
  NavGuard,
  NavLoader,
  NavMount,
  NavOptions,
  NavPlace,
  ScreenEntry,
  ScreenMatch,
} from './types.js'

type NavRequest = {
  path: string
  mode: 'go' | 'swap'
  resolve: () => void
}

export function createNav(options: NavOptions): Nav {
  const base = normalizePath(options.base ?? '/')
  const screens = normalizeScreens(options.screens, base)
  const layout = options.layout
  const missing = options.missing
  const beforeGo = options.beforeGo
  const where = signal(parseWindowPlace(window.location, screens, base))
  const warmed = new Map<string, Promise<NavMount>>()
  const navigateQueue: NavRequest[] = []
  let drainingNavigate = false

  let renderDispose: (() => void) | null = null
  let onPopState: (() => void) | null = null

  function toPlace(url: URL): NavPlace {
    const path = stripBase(url.pathname, base)
    const match = matchScreen(screens, path)
    return toPlaceObject(path, match?.params ?? {}, parseSearch(url.search), url.hash)
  }

  async function resolveMount(entry: ScreenEntry | MissingEntry): Promise<NavMount> {
    if (entry.mount) return entry.mount
    if (!entry.load) {
      const label = 'pattern' in entry ? entry.pattern : 'missing'
      throw new Error(`Jacaré nav: screen "${label}" has no mount`)
    }

    const key = 'pattern' in entry ? entry.pattern : '__missing__'
    const cached = warmed.get(key)
    if (cached) return cached

    const pending = entry
      .load()
      .then((mod) => resolveLoadedScreen(mod, key))
      .catch((error) => {
        warmed.delete(key)
        throw error
      })
    warmed.set(key, pending)
    return pending
  }

  function resolveLoadedScreen(mod: unknown, key: string): NavMount {
    if (typeof mod === 'function') {
      return mod as NavMount
    }
    if (mod && typeof mod === 'object') {
      const record = mod as ScreenModule
      if (record.mount ?? record.default) {
        return screen(record)
      }
    }
    throw new Error(`Jacaré nav: screen "${key}" load() returned no mount`)
  }

  type MissingEntry = { mount?: NavMount; load?: NavLoader }

  async function runGuard(to: NavPlace, from: NavPlace | null): Promise<NavPlace | false> {
    if (!beforeGo) return to
    const result = await beforeGo(to, from)
    if (result === false) return false
    if (typeof result === 'string') {
      return toPlace(new URL(resolveUrl(result), window.location.origin))
    }
    return to
  }

  function resolveUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    const raw = path.startsWith('/') ? path : `/${path}`
    const url = new URL(raw, 'http://local')
    const route = stripBase(url.pathname, base)
    const prefix = base === '/' ? '' : base
    return `${prefix}${buildPath(route, parseSearch(url.search))}${url.hash}`
  }

  async function navigateOnce(path: string, mode: 'go' | 'swap'): Promise<void> {
    const from = where.peek
    const url = new URL(resolveUrl(path), window.location.origin)
    const target = await runGuard(toPlace(url), from)
    if (target === false) return

    const samePlace =
      target.path === from.path &&
      JSON.stringify(target.search) === JSON.stringify(from.search) &&
      target.hash === from.hash

    // Always assign a fresh place object so the render effect remounts —
    // including same-path navigations used to recover a stuck screen.
    where.set({
      path: target.path,
      params: target.params,
      search: target.search,
      hash: target.hash,
    })

    const href = `${base === '/' ? '' : base}${buildPath(target.path, target.search)}${target.hash}`
    const locationHref = `${window.location.pathname}${window.location.search}${window.location.hash}`
    if (samePlace && locationHref === href) return

    if (mode === 'go') {
      history.pushState({ jacare: true }, '', href)
    } else {
      history.replaceState({ jacare: true }, '', href)
    }
  }

  async function drainNavigateQueue(): Promise<void> {
    if (drainingNavigate) return
    drainingNavigate = true
    try {
      while (navigateQueue.length > 0) {
        const request = navigateQueue.shift()!
        try {
          await navigateOnce(request.path, request.mode)
        } finally {
          request.resolve()
        }
      }
    } finally {
      drainingNavigate = false
    }
  }

  function navigate(path: string, mode: 'go' | 'swap'): Promise<void> {
    return new Promise((resolve) => {
      navigateQueue.push({ path, mode, resolve })
      void drainNavigateQueue()
    })
  }

  function buildContext(path: string, params: Record<string, string> = {}): NavContext {
    return {
      path,
      params,
      search: where.peek.search,
    }
  }

  async function mountScreenContent(host: HTMLElement, match: ScreenMatch): Promise<() => void> {
    const ctx = buildContext(where.peek.path, match.params)
    const mount = await resolveMount(match.entry)
    const dispose = mount(host, ctx)
    if (match.entry.title != null) {
      applyScreenTitle(match.entry.title, ctx)
    }
    return dispose
  }

  async function mountMissingContent(path: string, host: HTMLElement): Promise<() => void> {
    if (!missing) {
      const fallback = document.createElement('p')
      fallback.textContent = `No screen for ${path}`
      host.appendChild(fallback)
      return () => {
        fallback.remove()
      }
    }

    const ctx = buildContext(path)
    const mount = await resolveMount(
      isLoader(missing) ? { load: missing } : { mount: missing },
    )
    return mount(host, ctx)
  }

  function requireFrame(target: HTMLElement): HTMLElement {
    const frame = target.querySelector('[jacare-frame]')
    if (!(frame instanceof HTMLElement)) {
      throw new Error('Jacaré nav: layout requires an element with the jacare-frame attribute')
    }
    return frame
  }

  function startRender(target: HTMLElement): () => void {
    let active = 0
    let layoutDispose: (() => void) | null = null
    let layoutHost: HTMLElement | null = null
    let screenDispose: (() => void) | null = null

    const stop = effect(() => {
      const current = where()
      const match = matchScreen(screens, current.path)
      const runId = ++active

      try {
        screenDispose?.()
      } catch (error) {
        console.error(error)
      }
      screenDispose = null

      let host: HTMLElement

      if (layout) {
        if (!layoutDispose) {
          layoutDispose = layout(target, buildContext(current.path, match?.params ?? {}))
        }
        // Re-query every navigation — a reactive layout may replace [jacare-frame].
        layoutHost = requireFrame(target)
        layoutHost.replaceChildren()
        host = layoutHost
      } else {
        target.replaceChildren()
        host = target
      }

      syncGoLinks(current, base)

      if (!match) {
        void mountMissingContent(current.path, host)
          .then((dispose) => {
            if (runId !== active) {
              dispose()
              return
            }
            screenDispose = dispose
          })
          .catch((error) => {
            console.error(error)
            host.textContent = 'Failed to load screen'
          })
        return
      }

      void mountScreenContent(host, match)
        .then((dispose) => {
          if (runId !== active) {
            dispose()
            return
          }
          screenDispose = dispose
        })
        .catch((error) => {
          console.error(error)
          host.textContent = 'Failed to load screen'
        })
    })

    return () => {
      active++
      stop.dispose()
      screenDispose?.()
      layoutDispose?.()
      layoutHost = null
      target.replaceChildren()
    }
  }

  function onDocumentClick(event: MouseEvent): void {
    const target = event.target
    if (!(target instanceof Element)) return
    const link = target.closest('[jacare-go]')
    if (!(link instanceof HTMLAnchorElement)) return
    const href = link.getAttribute('jacare-go')
    if (!href) return
    event.preventDefault()
    void navigate(href, 'go')
  }

  return {
    where,

    attach(target: HTMLElement): () => void {
      if (onPopState) {
        window.removeEventListener('popstate', onPopState)
        onPopState = null
      }
      document.removeEventListener('click', onDocumentClick)
      renderDispose?.()
      renderDispose = null
      target.replaceChildren()

      where.set(parseWindowPlace(window.location, screens, base))

      onPopState = () => {
        where.set(parseWindowPlace(window.location, screens, base))
      }
      window.addEventListener('popstate', onPopState)
      document.addEventListener('click', onDocumentClick)
      renderDispose = startRender(target)
      syncGoLinks(where.peek, base)

      return () => {
        if (onPopState) {
          window.removeEventListener('popstate', onPopState)
          onPopState = null
        }
        document.removeEventListener('click', onDocumentClick)
        renderDispose?.()
        renderDispose = null
      }
    },

    go(path: string): Promise<void> {
      return navigate(path, 'go')
    },

    swap(path: string): Promise<void> {
      return navigate(path, 'swap')
    },

    undo(): void {
      history.back()
    },

    async warm(path: string): Promise<void> {
      const normalized = normalizePath(path)
      const match = matchScreen(screens, normalized)
      if (!match?.entry.load) return
      await resolveMount(match.entry)
    },
  }
}

function stripBase(pathname: string, base: string): string {
  const path = normalizePath(pathname)
  if (base === '/') return path
  if (path.startsWith(base)) {
    return normalizePath(path.slice(base.length) || '/')
  }
  return path
}

function toPlaceObject(
  path: string,
  params: Record<string, string>,
  search: Record<string, string>,
  hash: string,
): NavPlace {
  return { path, params, search, hash }
}

function parseWindowPlace(
  loc: { pathname: string; search: string; hash: string },
  entries: ScreenEntry[],
  base: string,
): NavPlace {
  const path = stripBase(loc.pathname, base)
  const match = matchScreen(entries, path)
  return toPlaceObject(path, match?.params ?? {}, parseSearch(loc.search), loc.hash)
}

function syncGoLinks(place: NavPlace, base: string): void {
  for (const link of document.querySelectorAll('[jacare-go]')) {
    if (!(link instanceof HTMLElement)) continue
    const href = link.getAttribute('jacare-go')
    const here = href ? linkMatchesHref(href, place, base) : false
    link.classList.toggle('jacare-here', here)
    if (here) {
      link.setAttribute('aria-current', 'page')
    } else {
      link.removeAttribute('aria-current')
    }
  }
}

function linkMatchesHref(href: string, place: NavPlace, base: string): boolean {
  try {
    const url = new URL(href, window.location.origin)
    const path = stripBase(url.pathname, base)
    const search = parseSearch(url.search)
    const hash = url.hash
    return (
      normalizePath(path) === place.path &&
      JSON.stringify(search) === JSON.stringify(place.search) &&
      hash === place.hash
    )
  } catch {
    return normalizePath(stripBase(href, base)) === place.path
  }
}
