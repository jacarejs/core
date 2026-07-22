import { pulse } from '@jacare/core'

const STORAGE_KEY = 'jacare-lab:devtools'

function readStored() {
  if (typeof localStorage === 'undefined') return true
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === null) return true
  return raw !== '0'
}

export const devtoolsEnabled = pulse(readStored())

let dispose = null

export async function syncDevtools() {
  if (devtoolsEnabled()) {
    if (dispose) return
    const { connectJacareDevtools } = await import('@jacare/devtools')
    dispose = connectJacareDevtools()
    return
  }
  dispose?.()
  dispose = null
}

export async function toggleDevtools() {
  const next = !devtoolsEnabled()
  devtoolsEnabled.set(next)
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
  }
  await syncDevtools()
}

export function devtoolsLabel() {
  return devtoolsEnabled() ? 'DevTools on' : 'DevTools off'
}
