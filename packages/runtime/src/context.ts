import type { Subscriber } from './types.js'
import * as devtools from './devtools/registry.js'

let tracking = false
let currentOwner: OwnerNode | null = null
let batchDepth = 0
let notifyDepth = 0
let flushDepth = 0
let patience = false
let microtaskArmed = false
const pending = new Set<Subscriber>()

const MAX_NOTIFY_DEPTH = 200

export class ReactiveCycleError extends Error {
  readonly depth: number

  constructor(depth: number) {
    super(
      `Jacaré: reactive cycle detected — updates kept cascading past ${depth} nested levels. ` +
        'An effect is writing to a pulse that it also reads. Read with `pulse.peek`, write with ' +
        '`pulse.update(fn)`, or wrap the read in `untrack(() => ...)` to break the loop.',
    )
    this.name = 'ReactiveCycleError'
    this.depth = depth
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
  if (!patience && pending.size === 0) return
  flushSync()
  patience = false
}

export function schedule(subscriber: Subscriber): void {
  if (batchDepth > 0) {
    pending.add(subscriber)
    return
  }
  if (patience && flushDepth === 0) {
    pending.add(subscriber)
    armMicrotask()
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
    if (batchDepth === 0 && pending.size > 0) {
      flushPending()
    }
  }
}

export function flushSync(): void {
  microtaskArmed = false
  if (pending.size > 0) {
    flushPending()
  }
}

export function flushPending(): void {
  flushDepth++
  try {
    while (pending.size > 0) {
      const queue = Array.from(pending)
      pending.clear()
      for (const subscriber of queue) {
        runSubscriber(subscriber)
      }
    }
  } finally {
    flushDepth--
  }
}

function runSubscriber(subscriber: Subscriber): void {
  if (notifyDepth >= MAX_NOTIFY_DEPTH) {
    throw new ReactiveCycleError(MAX_NOTIFY_DEPTH)
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
    if (pending.size > 0) {
      flushPending()
    }
  })
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
