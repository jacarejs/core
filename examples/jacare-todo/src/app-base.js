const base = import.meta.env.BASE_URL ?? '/'

function stripTrailingSlash(value) {
  if (!value || value === '/') return ''
  return value.endsWith('/') ? value.slice(0, -1) : value
}

const root = stripTrailingSlash(base)

export function appHref(path = '/') {
  if (!path || path === '/') {
    return root ? `${root}/` : '/'
  }
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${root}${suffix}`
}

export function assetUrl(path) {
  return `${base}${path.replace(/^\//, '')}`
}

export const APP_BASE = root || '/'
