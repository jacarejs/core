export function basename(filePath = '') {
  const value = String(filePath)
  const slash = Math.max(value.lastIndexOf('/'), value.lastIndexOf('\\'))
  return slash >= 0 ? value.slice(slash + 1) : value
}

export function dirname(filePath = '') {
  const value = String(filePath)
  const slash = Math.max(value.lastIndexOf('/'), value.lastIndexOf('\\'))
  return slash >= 0 ? value.slice(0, slash) : '.'
}

export function join(...parts) {
  return parts
    .filter((part) => part != null && part !== '')
    .map(String)
    .join('/')
    .replace(/\/{2,}/g, '/')
}

export function resolve(...parts) {
  return join(...parts)
}

export function isAbsolute(filePath = '') {
  return String(filePath).startsWith('/')
}

export default {
  basename,
  dirname,
  join,
  resolve,
  isAbsolute,
}
