/** DEV write ledger — ring buffer of recent pulse writes for why(). */

export interface WriteRecord {
  value: unknown
  prev: unknown
  at: number
  /** Raw Error().stack — parse lazily in why(). */
  stack?: string
}

const RING_SIZE = 10
const ring = new Map<number, WriteRecord[]>()
let lastWritePulseId: number | null = null

export function recordWrite(pulseId: number, prev: unknown, next: unknown): void {
  let stack: string | undefined
  try {
    stack = new Error().stack
  } catch {
    stack = undefined
  }
  const entry: WriteRecord = {
    value: next,
    prev,
    at: Date.now(),
    ...(stack ? { stack } : {}),
  }
  let list = ring.get(pulseId)
  if (!list) {
    list = []
    ring.set(pulseId, list)
  }
  list.push(entry)
  if (list.length > RING_SIZE) list.shift()
  lastWritePulseId = pulseId
}

export function getWrites(pulseId: number): WriteRecord[] {
  const list = ring.get(pulseId)
  return list ? [...list] : []
}

export function getLastWritePulseId(): number | null {
  return lastWritePulseId
}

export function clearLedger(): void {
  ring.clear()
  lastWritePulseId = null
}
