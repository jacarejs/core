import type { Subscriber } from './types.js'
import * as devtools from './devtools/registry.js'
import { formatWhyChain, whyLast, type WhyChain } from './devtools/why.js'

let tracking = false
let currentOwner: OwnerNode | null = null
let batchDepth = 0
let notifyDepth = 0
let flushDepth = 0
let patience = false
let microtaskArmed = false
let idleArmed = false
let currentLane: PatienceLane = 'default'

const pendingInput = new Set<Subscriber>()
const pendingDefault = new Set<Subscriber>()
const pendingIdle = new Set<Subscriber>()

const LANE_RANK: Record<PatienceLane, number> = {
  input: 0,
  default: 1,
  idle: 2,
}

export type PatienceLane = 'input' | 'default' | 'idle'

const MAX_NOTIFY_DEPTH = 200

export class ReactiveCycleError extends Error {
  readonly depth: number
  why?: WhyChain
  whyText?: string

  constructor(depth: number, whyText?: string, why?: WhyChain) {
    const base =
      `Jacaré: reactive cycle detected — updates kept cascading past ${depth} nested levels. ` +
      'An effect is writing to a pulse that it also reads. Read with `pulse.peek`, write with ' +
      '`pulse.update(fn)`, or wrap the read in `untrack(() => ...)` to break the loop.'
    super(whyText ? `${base}\n\nwhy:\n${whyText}` : base)
    this.name = 'ReactiveCycleError'
    this.depth = depth
    if (why) this.why = why
    if (whyText) this.whyText = whyText
  }
}

export class OwnerNode {
  run?: Subscriber
  private depUnsubs: CleanupFn[] = []
  private cleanups: CleanupFn[] = []
  readonly children: OwnerNode[] = []
  private disposed = false

  constructor(readonly parent: OwnerNode | null = currentOwner) {
    if (parent) {
      parent.children.push(this)
    }
  }

  clearDependencies(): void {
    for (const unsub of this.depUnsubs) {
      unsub()
    }
    this.depUnsubs.length = 0
  }

  addDependency(unsub: CleanupFn): void {
    this.depUnsubs.push(unsub)
  }

  onDispose(fn: CleanupFn): void {
    this.cleanups.push(fn)
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.clearDependencies()
    for (let i = this.cleanups.length - 1; i >= 0; i--) {
      this.cleanups[i]!()
    }
    this.cleanups.length = 0
    for (const child of this.children) {
      child.dispose()
    }
    this.children.length = 0
  }
}

type CleanupFn = () => void

export function isTracking(): boolean {
  return tracking
}

export function getCurrentOwner(): OwnerNode | null {
  return currentOwner
}

export function runWithOwner<T>(owner: OwnerNode, fn: () => T): T {
  const prev = currentOwner
  currentOwner = owner
  try {
    return fn()
  } finally {
    currentOwner = prev
  }
}

export function runTracked<T>(owner: OwnerNode, fn: () => T): T {
  const prevOwner = currentOwner
  const prevTracking = tracking
  currentOwner = owner
  tracking = true
  try {
    return fn()
  } finally {
    currentOwner = prevOwner
    tracking = prevTracking
  }
}

export function runUntracked<T>(fn: () => T): T {
  const prev = tracking
  tracking = false
  try {
    return fn()
  } finally {
    tracking = prev
  }
}

export function startTracking(): void {
  tracking = true
}

export function stopTracking(): void {
  tracking = false
}

export function trackDependency(cell: DependencyCell): void {
  if (!tracking || !currentOwner?.run) return
  const run = currentOwner.run
  if (cell.has(run)) return
  currentOwner.addDependency(cell.subscribe(run))
  devtools.linkDependency(cell, currentOwner)
}

export function isPatienceEnabled(): boolean {
  return patience
}

export function enablePatience(): void {
  patience = true
}

export function disablePatience(): void {
  if (!patience && pendingSize() === 0) return
  flushSync()
  patience = false
}

/** Mark writes in `fn` as originating from a lane (runtime/compiler — not an author priority API). */
export function runAsLane<T>(lane: PatienceLane, fn: () => T): T {
  const prev = currentLane
  currentLane = lane
  try {
    return fn()
  } finally {
    currentLane = prev
  }
}

export function schedule(subscriber: Subscriber): void {
  if (batchDepth > 0) {
    enqueue(subscriber, currentLane)
    return
  }
  if (patience && flushDepth === 0) {
    enqueue(subscriber, currentLane)
    if (currentLane === 'idle') {
      armIdle()
    } else {
      armMicrotask()
    }
    return
  }
  runSubscriber(subscriber)
}

export function batch<T>(fn: () => T): T {
  batchDepth++
  try {
    return fn()
  } finally {
    batchDepth--
    if (batchDepth === 0 && pendingSize() > 0) {
      flushPending()
    }
  }
}

export function flushSync(): void {
  microtaskArmed = false
  idleArmed = false
  if (pendingSize() > 0) {
    flushPending({ includeIdle: true })
  }
}

export function flushPending(options: { includeIdle?: boolean } = {}): void {
  const includeIdle = options.includeIdle === true
  flushDepth++
  try {
    let guard = 0
    while (pendingInput.size > 0 || pendingDefault.size > 0 || (includeIdle && pendingIdle.size > 0)) {
      if (++guard > MAX_NOTIFY_DEPTH) {
        throw new ReactiveCycleError(MAX_NOTIFY_DEPTH)
      }
      drainLane(pendingInput)
      drainLane(pendingDefault)
      if (includeIdle) {
        drainLane(pendingIdle)
      }
    }
    if (!includeIdle && pendingIdle.size > 0) {
      armIdle()
    }
  } finally {
    flushDepth--
  }
}

function drainLane(queue: Set<Subscriber>): void {
  if (queue.size === 0) return
  const batch = Array.from(queue)
  queue.clear()
  for (const subscriber of batch) {
    runSubscriber(subscriber)
  }
}

function pendingSize(): number {
  return pendingInput.size + pendingDefault.size + pendingIdle.size
}

function enqueue(subscriber: Subscriber, lane: PatienceLane): void {
  const rank = LANE_RANK[lane]
  if (pendingInput.has(subscriber)) {
    if (rank > 0) return
  } else if (pendingDefault.has(subscriber)) {
    if (rank > 1) return
    pendingDefault.delete(subscriber)
  } else if (pendingIdle.has(subscriber)) {
    pendingIdle.delete(subscriber)
  }

  if (lane === 'input') pendingInput.add(subscriber)
  else if (lane === 'default') pendingDefault.add(subscriber)
  else pendingIdle.add(subscriber)
}

function runSubscriber(subscriber: Subscriber): void {
  if (notifyDepth >= MAX_NOTIFY_DEPTH) {
    let whyText: string | undefined
    let whyChain: WhyChain | undefined
    try {
      if (devtools.isDevtoolsEnabled()) {
        const chain = whyLast()
        if (chain) {
          whyChain = {
            ...chain,
            target: { kind: 'error', label: 'ReactiveCycleError' },
          }
          whyText = formatWhyChain(whyChain)
        }
      }
    } catch {
      // why attachment is best-effort
    }
    throw new ReactiveCycleError(MAX_NOTIFY_DEPTH, whyText, whyChain)
  }
  notifyDepth++
  try {
    subscriber()
  } finally {
    notifyDepth--
  }
}

function armMicrotask(): void {
  if (microtaskArmed) return
  microtaskArmed = true
  queueMicrotask(() => {
    microtaskArmed = false
    if (pendingInput.size > 0 || pendingDefault.size > 0) {
      flushPending({ includeIdle: false })
    } else if (pendingIdle.size > 0) {
      armIdle()
    }
  })
}

function armIdle(): void {
  if (idleArmed || pendingIdle.size === 0) return
  idleArmed = true
  const run = (): void => {
    idleArmed = false
    if (pendingIdle.size === 0) return
    flushPending({ includeIdle: true })
  }
  if (typeof globalThis.requestIdleCallback === 'function') {
    globalThis.requestIdleCallback(() => run(), { timeout: 50 })
    return
  }
  setTimeout(run, 1)
}

export class DependencyCell {
  private subs: Subscriber[] = []
  private readonly subSet = new Set<Subscriber>()
  private subCount = 0

  get subscriberCount(): number {
    return this.subCount
  }

  has(fn: Subscriber): boolean {
    return this.subSet.has(fn)
  }

  notify(): void {
    const subs = this.subs.slice(0, this.subCount)
    for (const subscriber of subs) {
      if (typeof subscriber === 'function') {
        schedule(subscriber)
      }
    }
  }

  subscribe(fn: Subscriber): () => void {
    if (this.subSet.has(fn)) {
      return () => this.unlink(fn)
    }
    this.subs.push(fn)
    this.subSet.add(fn)
    this.subCount++
    return () => this.unlink(fn)
  }

  private unlink(fn: Subscriber): void {
    if (!this.subSet.has(fn)) return
    this.subSet.delete(fn)
    const idx = this.subs.indexOf(fn)
    if (idx === -1) return
    this.subs[idx] = this.subs[this.subCount - 1]!
    this.subs.pop()
    this.subCount--
  }
}
