export interface ScopeEntry {
  id: string
  label: string
  read: () => unknown
}

export interface ScopeSnapshot {
  entries: Array<{ id: string; label: string; value: unknown }>
  updatedAt: number
}

const entries = new Map<string, ScopeEntry>()
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) {
    listener()
  }
}

export function registerScope(id: string, label: string, read: () => unknown): () => void {
  entries.set(id, { id, label, read })
  emit()
  return () => {
    entries.delete(id)
    emit()
  }
}

export function clearScope(): void {
  entries.clear()
  emit()
}

export function getScopeSnapshot(): ScopeSnapshot {
  const snapshot: ScopeSnapshot['entries'] = []
  for (const entry of entries.values()) {
    snapshot.push({
      id: entry.id,
      label: entry.label,
      value: entry.read(),
    })
  }
  return { entries: snapshot, updatedAt: Date.now() }
}

export function subscribeScope(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function startScopePulse(intervalMs = 120): () => void {
  const timer = window.setInterval(() => emit(), intervalMs)
  return () => window.clearInterval(timer)
}
