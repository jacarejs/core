import { pulse } from '@jacare/core'

export const activeCode = pulse(null)

export function showCode(title, codeOrFiles, maybeFiles) {
  if (Array.isArray(codeOrFiles)) {
    activeCode.set({ title, files: codeOrFiles })
    return
  }
  const files = Array.isArray(maybeFiles) ? maybeFiles : null
  if (files && files.length > 0) {
    activeCode.set({
      title,
      files: [{ name: 'usage (parent)', code: codeOrFiles }, ...files],
    })
    return
  }
  activeCode.set({
    title,
    files: [{ name: 'usage', code: codeOrFiles }],
  })
}

export function hideCode() {
  activeCode.set(null)
}
