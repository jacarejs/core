import { pulse } from '@jacare/core'

export const activeCode = pulse(null)

export function showCode(title, code) {
  activeCode.set({ title, code })
}

export function hideCode() {
  activeCode.set(null)
}
