import { afterEach, describe, expect, it } from 'vitest'
import { resetDevtoolsForTests } from '../src/devtools/registry.js'
import {
  clearHighlight,
  computed,
  effect,
  enableDevtools,
  getBindingsForPulse,
  getPulseGraph,
  highlightBinding,
  registerBinding,
  signal,
} from '../src/index.js'

describe('devtools', () => {
  afterEach(() => {
    resetDevtoolsForTests()
  })

  it('tracks pulses before enable and exposes them after', () => {
    const count = signal(0)
    count.set(1)
    expect(getPulseGraph().nodes).toHaveLength(0)

    enableDevtools()
    const graph = getPulseGraph()
    expect(graph.nodes).toHaveLength(1)
    expect(graph.nodes[0]?.value).toBe(1)

    count.set(2)
    expect(getPulseGraph().nodes[0]?.value).toBe(2)
  })

  it('keeps edges created before enable', () => {
    const count = signal(1)
    const doubled = computed(() => count() * 2)
    doubled()

    enableDevtools()
    const graph = getPulseGraph()
    const signalNode = graph.nodes.find((node) => node.kind === 'signal')
    const computedNode = graph.nodes.find((node) => node.kind === 'computed')
    expect(signalNode?.value).toBe(1)
    expect(computedNode?.value).toBe(2)
    expect(graph.edges).toEqual(
      expect.arrayContaining([{ from: signalNode!.id, to: computedNode!.id }]),
    )
  })

  it('records signals, derived values, and dependencies', () => {
    enableDevtools()

    const count = signal(0)
    const doubled = computed(() => count() * 2)
    const runs: number[] = []

    effect(() => {
      runs.push(doubled())
    })

    const graph = getPulseGraph()
    expect(graph.nodes).toHaveLength(3)

    const signalNode = graph.nodes.find((node) => node.kind === 'signal')
    const computedNode = graph.nodes.find((node) => node.kind === 'computed')
    const effectNode = graph.nodes.find((node) => node.kind === 'effect')

    expect(signalNode?.value).toBe(0)
    expect(computedNode?.value).toBe(0)
    expect(effectNode).toBeDefined()
    expect(graph.edges).toEqual(
      expect.arrayContaining([
        { from: signalNode!.id, to: computedNode!.id },
        { from: computedNode!.id, to: effectNode!.id },
      ]),
    )

    count.set(2)
    const updated = getPulseGraph()
    const updatedSignal = updated.nodes.find((node) => node.kind === 'signal')
    const updatedComputed = updated.nodes.find((node) => node.kind === 'computed')
    expect(updatedSignal?.value).toBe(2)
    expect(updatedComputed?.value).toBe(4)
    expect(runs).toEqual([0, 4])
  })

  it('stores source names from options', () => {
    enableDevtools()
    const count = signal(0, { name: 'count', file: 'Counter.jcr', line: 4 })
    const total = computed(() => count() * 2, { name: 'total', file: 'Cart.jcr', line: 12 })
    effect(() => total(), { name: 'titleSync' })

    const graph = getPulseGraph()
    expect(graph.nodes.find((n) => n.kind === 'signal')?.name).toBe('count')
    expect(graph.nodes.find((n) => n.kind === 'computed')?.name).toBe('total')
    expect(graph.nodes.find((n) => n.kind === 'effect')?.name).toBe('titleSync')
    expect(graph.nodes.find((n) => n.kind === 'signal')?.file).toBe('Counter.jcr')
  })

  it('registers DOM bindings and highlights them', () => {
    enableDevtools()
    const count = signal(0, { name: 'count' })
    const el = document.createElement('span')
    document.body.appendChild(el)
    const dispose = registerBinding(count, el, { kind: 'text', file: 'App.jcr', line: 10 })

    expect(getBindingsForPulse(getPulseGraph().nodes[0]!.id)).toHaveLength(1)
    highlightBinding(getPulseGraph().nodes[0]!.id)
    expect(el.classList.contains('jacare-devtools-highlight')).toBe(true)
    clearHighlight()
    expect(el.classList.contains('jacare-devtools-highlight')).toBe(false)
    dispose()
    el.remove()
  })

  it('marks computed nodes stale before refresh', () => {
    enableDevtools()

    const source = signal(1)
    const derived = computed(() => source() + 1)

    derived()
    source.set(2)
    derived()

    const node = getPulseGraph().nodes.find((item) => item.kind === 'computed')
    expect(node?.value).toBe(3)
    expect(node?.stale).toBe(false)
  })
})
