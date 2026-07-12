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

export function appRoute(path = '/') {
  if (!path || path === '/') return '/'
  const queryIndex = path.indexOf('?')
  const pathname = queryIndex === -1 ? path : path.slice(0, queryIndex)
  const query = queryIndex === -1 ? '' : path.slice(queryIndex)
  const suffix = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${suffix}${query}`
}

export function assetUrl(path) {
  return `${base}${path.replace(/^\//, '')}`
}

function normalizeBase(value) {
  if (!value || value === '/') return '/'
  return value.endsWith('/') ? value.slice(0, -1) : value
}

export function restoreSpaPath() {
  const key = 'jacare:spa-restore'
  const raw = sessionStorage.getItem(key)
  if (!raw) return
  sessionStorage.removeItem(key)
  try {
    const saved = JSON.parse(raw)
    if (normalizeBase(saved.base) !== normalizeBase(base)) return
    history.replaceState(null, '', saved.href)
  } catch {}
}

export const APP_BASE = root || '/'
