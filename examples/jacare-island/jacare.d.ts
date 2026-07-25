declare module '*.jcr' {
  export function mount(target: HTMLElement, props?: Record<string, unknown>): () => void
  export function render(props?: Record<string, unknown>): { html: string; state: unknown }
  export function resume(target: HTMLElement, state: unknown): () => void
  const _default: typeof mount
  export default _default
}
