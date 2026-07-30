export const i18nSetupCode = `// src/i18n.js
import { createI18n, setLocale, locale, te } from '@jacare/ui/i18n'
import { messages } from './locales/index.js'

createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages, // { en: {...}, 'pt-BR': {...}, es: {...} }
})

// Lab wraps t()/translate() to return a string (not a derive)
// so :title=\${t('key')} and placeholders stay reactive.
export function t(key, params) {
  /* read locale() → return interpolated string */
}
export { setLocale, locale, te }
`

export const i18nMessagesCode = `// locales/en.js
export default {
  home: {
    hello: 'Hello, {name}!',
    tip: 'Change the language in the top bar.',
  },
}

// locales/pt-BR.js · es.js — same key tree, translated values
`

export const i18nMessagesSample = `messages = {
  en: { home: { hello: 'Hello, {name}!' } },
  'pt-BR': { home: { hello: 'Olá, {name}!' } },
  es: { home: { hello: 'Hola, {name}!' } },
}`

export const i18nTemplateCode = `import { t } from './i18n.js'

export <view>
  <!-- Text and props: call t() inside the template -->
  <h1>\${t('home.hello', { name: 'Jacaré' })}</h1>
  <Card :title=\${t('home.tip')} />
</view>
`

export const i18nParamsCode = `import { pulse } from '@jacare/core'
import { t, translate } from './i18n.js'

const name = pulse('')

export <view>
  <input bind-value=\${name} placeholder=\${t('home.namePlaceholder')} />
  <p>\${() => translate('home.hello', { name: name() || '…' })}</p>
</view>
`

export const i18nSelectCode = `import Select from '@jacare/ui/Select'
import { setLocale, localeModel, LOCALE_OPTIONS } from './i18n.js'

function onLocaleChange(next) {
  if (next) setLocale(String(next)) // persists to localStorage (j-locale)
}

export <view>
  <Select
    :options=\${LOCALE_OPTIONS}
    :searchable=\${false}
    bind-value=\${localeModel}
    on-change=\${onLocaleChange}
  />
</view>
`

export const i18nPitfallsCode = `// ❌ Frozen — evaluated once at module load
const title = t('home.hello')

const rows = [
  { label: t('home.a') }, // ❌ string frozen in English
]

// ✅ Keep the key; translate in the template
const rows = [
  { labelKey: 'home.a' },
]

export <view>
  <span>\${t(row.labelKey)}</span>
  <h1>\${t('home.hello')}</h1>
</view>
`
