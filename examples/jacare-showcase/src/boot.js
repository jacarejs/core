import './app.css'
import './styles/animations.css'
import './styles/highlight.css'
import { effect } from '@jacare/core'
import { nav } from './nav.js'
import { restoreSpaPath } from './app-base.js'
import { initPageProgress, initReveal } from './utils/motion.js'

let disposeDevtools = null
if (import.meta.env.DEV) {
  const { connectJacareDevtools } = await import('@jacare/devtools')
  disposeDevtools = connectJacareDevtools({ scope: false })
}

const root = document.getElementById('app')
if (!root) throw new Error('Missing #app')

restoreSpaPath()

const LAZY_ROUTES = new Set(['/game', '/tutorial', '/playground', '/components'])

let dispose = nav.attach(root)
let stopReveal = initReveal()
let stopProgress = initPageProgress()
let revealTimer = null
let lastPath = null

const stopScrollTop = effect(() => {
  const path = nav.where().path
  if (lastPath !== null && lastPath !== path) {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    window.clearTimeout(revealTimer)
    revealTimer = window.setTimeout(() => {
      stopReveal?.()
      stopReveal = initReveal()
    }, 40)
  }
  lastPath = path
})

function warmRoute(path) {
  void nav.warm(path)
}

function onPointerPrefetch(event) {
  const target = event.target
  if (!(target instanceof Element)) return
  const link = target.closest('[jacare-go]')
  if (!(link instanceof HTMLElement)) return
  const href = link.getAttribute('jacare-go')
  if (href && LAZY_ROUTES.has(href)) warmRoute(href)
}

document.addEventListener('pointerenter', onPointerPrefetch, true)
document.addEventListener('focusin', onPointerPrefetch, true)

const warmIdle = () => {
  warmRoute('/tutorial')
  warmRoute('/playground')
}
if (typeof window.requestIdleCallback === 'function') {
  window.requestIdleCallback(warmIdle, { timeout: 2800 })
} else {
  window.setTimeout(warmIdle, 1400)
}

if (import.meta.hot) {
  import.meta.hot.accept()
  import.meta.hot.dispose(() => {
    window.clearTimeout(revealTimer)
    document.removeEventListener('pointerenter', onPointerPrefetch, true)
    document.removeEventListener('focusin', onPointerPrefetch, true)
    stopScrollTop?.dispose?.()
    stopReveal?.()
    stopProgress?.()
    disposeDevtools?.()
    disposeDevtools = null
    dispose?.()
    dispose = null
  })
}
