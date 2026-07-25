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
