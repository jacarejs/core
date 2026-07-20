export type Subscriber = () => void

export type Cleanup = () => void

export interface Signal<T> {
  (): T
  readonly peek: T
  set(value: T): void
  update(fn: (prev: T) => T): void
  subscribe(fn: Subscriber): Cleanup
}

export interface ReadonlySignal<T> {
  (): T
  readonly peek: T
  subscribe(fn: Subscriber): Cleanup
}

export interface Computed<T> extends ReadonlySignal<T> {}

export interface Effect {
  dispose(): void
}

export interface EffectOptions {
  defer?: boolean
  name?: string
  file?: string
  line?: number
}
