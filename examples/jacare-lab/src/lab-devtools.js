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
let disposeHook = null

export async function syncDevtools() {
  if (!disposeHook) {
    const { installPageHook } = await import('@jacare/devtools/hook')
    disposeHook = installPageHook({ coreVersion: '0.1.10' })
  }

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
