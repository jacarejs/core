export type NavMount = (target: HTMLElement, ctx: NavContext) => () => void

export type NavLoader = () => Promise<{ mount?: NavMount; default?: NavMount }>

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

export interface NavOptions {
  layout?: NavMount
  screens: Record<string, NavMount | NavLoader>
  missing?: NavMount | NavLoader
  base?: string
  beforeGo?: NavGuard
}

export interface ScreenEntry {
  pattern: string
  mount?: NavMount
  load?: NavLoader
}

export interface ScreenMatch {
  entry: ScreenEntry
  params: Record<string, string>
}

export interface Nav {
  readonly where: () => NavPlace
  attach(target: HTMLElement): () => void
  go(path: string): Promise<void>
  swap(path: string): Promise<void>
  undo(): void
  warm(path: string): Promise<void>
}
