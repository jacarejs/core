import type { Signal } from '../types.js'
import type { ScreenModule, ScreenTitle } from './screen.js'

export type NavMount = (target: HTMLElement, ctx: NavContext) => () => void

export type NavLoader = () => Promise<ScreenModule | NavMount>

export interface NavContext {
  path: string
  params: Record<string, string>
  search: Record<string, string>
}

export interface NavPlace {
  path: string
  params: Record<string, string>
  search: Record<string, string>
  hash: string
}

export type NavGuard = (
  to: NavPlace,
  from: NavPlace | null,
) => void | string | false | Promise<void | string | false>

/** Screen entry in createNav — mount/loader, or `{ use, title }` for a nav-level title. */
export interface ScreenRouteConfig {
  use: NavMount | NavLoader
  title?: ScreenTitle
}

export type ScreenDefinition = NavMount | NavLoader | ScreenRouteConfig

export interface NavOptions {
  layout?: NavMount
  screens: Record<string, ScreenDefinition>
  missing?: NavMount | NavLoader
  base?: string
  beforeGo?: NavGuard
}

export interface ScreenEntry {
  pattern: string
  mount?: NavMount
  load?: NavLoader
  title?: ScreenTitle
}

export interface ScreenMatch {
  entry: ScreenEntry
  params: Record<string, string>
}

export interface NavGoOptions {
  /** Focus after mount. `true` → `[data-jacare-focus]`; string → CSS selector. */
  focus?: boolean | string
}

export interface Nav {
  readonly where: Signal<NavPlace>
  attach(target: HTMLElement): () => void
  go(path: string, options?: NavGoOptions): Promise<void>
  swap(path: string, options?: NavGoOptions): Promise<void>
  undo(): void
  warm(path: string): Promise<void>
}
