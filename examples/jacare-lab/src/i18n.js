import { createI18n, setLocale, te, availableLocales } from '@jacare/ui/i18n'
import { messages } from './locales/index.js'

export const LOCALE_LABELS = {
  en: 'English',
  'pt-BR': 'Português',
  es: 'Español',
}

/** Options for @jacare/ui Select — { value, label }. */
export const LOCALE_OPTIONS = Object.entries(LOCALE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

/** Compact codes for the lab topbar Select. */
export const LOCALE_OPTIONS_COMPACT = [
  { value: 'en', label: 'EN' },
  { value: 'pt-BR', label: 'PT' },
  { value: 'es', label: 'ES' },
]

const FALLBACK_LOCALE = 'en'

const i18n = createI18n({
  locale: FALLBACK_LOCALE,
  fallbackLocale: FALLBACK_LOCALE,
  messages,
})

/** Locale pulse from createI18n — bind with Select bind-value; already hydrated from localStorage (j-locale). */
export const localeModel = i18n.locale

function lookup(bag, key) {
  if (!bag || key == null || key === '') return undefined
  if (typeof bag[key] === 'string') return bag[key]
  let current = bag
  for (const part of String(key).split('.')) {
    if (current == null || typeof current !== 'object') return undefined
    current = current[part]
  }
  return typeof current === 'string' ? current : undefined
}

function interpolate(template, params) {
  if (!params || typeof params !== 'object') return template
  return template.replace(/\{(\w+)\}/g, (_, name) => {
    const value = params[name]
    return value == null ? `{${name}}` : String(value)
  })
}

/**
 * Immediate translated string. Reads the active locale signal so Jacaré
 * effects / prop getters that call `t()` or `translate()` re-run on change.
 * Do not call at module top-level for values that must stay reactive —
 * store a key and call translate/t inside the template instead.
 */
export function translate(key, params) {
  const active = i18n.locale()
  const message =
    lookup(messages[active], key) ??
    (active === FALLBACK_LOCALE ? undefined : lookup(messages[FALLBACK_LOCALE], key))
  return message == null ? String(key ?? '') : interpolate(message, params)
}

/** Alias for translate — use in templates: ${t('key')} or :title=${t('key')}. */
export function t(key, params) {
  return translate(key, params)
}

export function locale() {
  return i18n.locale()
}

export { setLocale, te, availableLocales }
