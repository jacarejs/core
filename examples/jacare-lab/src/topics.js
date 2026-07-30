import { t } from './i18n.js'

export const LESSONS = [
  { path: '/', id: 'start' },
  { path: '/quick-start', id: 'quick-start' },
  { path: '/module', id: 'module' },
  { path: '/typescript', id: 'typescript' },
  { path: '/language', id: 'language' },
  { path: '/binding-ir', id: 'binding-ir' },
  { path: '/reactivity', id: 'reactivity' },
  { path: '/bag', id: 'bag' },
  { path: '/templates', id: 'templates' },
  { path: '/bindings', id: 'bindings' },
  { path: '/events', id: 'events' },
  { path: '/debug', id: 'debug' },
  { path: '/why', id: 'why' },
  { path: '/if', id: 'if' },
  { path: '/case', id: 'case' },
  { path: '/for', id: 'for' },
  { path: '/components', id: 'components' },
  { path: '/css', id: 'css' },
  { path: '/nav', id: 'nav' },
  { path: '/forms', id: 'forms' },
  { path: '/lifecycle', id: 'lifecycle' },
  { path: '/cookbook', id: 'cookbook' },
  { path: '/playground', id: 'playground' },
  { path: '/ssr', id: 'ssr' },
  { path: '/island', id: 'island' },
  { path: '/tooling', id: 'tooling' },
  { path: '/helpers', id: 'helpers' },
  { path: '/i18n', id: 'i18n' },
  { path: '/ui', id: 'ui' },
]

export function lessonTitle(id) {
  return t(`lesson.${id}.title`)
}

export function lessonBlurb(id) {
  return t(`lesson.${id}.blurb`)
}
