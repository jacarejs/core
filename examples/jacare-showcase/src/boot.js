import './app.css'
import './styles/animations.css'
import './styles/highlight.css'
import { effect } from '@jacare/core'
import { nav } from './nav.js'
import { restoreSpaPath } from './app-base.js'
import { pageLoading, pageLoadingLabel } from './page-loading.js'
import { initPageProgress, initReveal } from './utils/motion.js'

if (import.meta.env.DEV) {
  const { connectJacareDevtools } = await import('@jacare/devtools')
  connectJacareDevtools({ scope: false })
}

const root = document.getElementById('app')
if (!root) throw new Error('Missing #app')

restoreSpaPath()

const LAZY_LABELS = {
  '/game': 'Booting Jacaré Arcade…',
  '/tutorial': 'Opening tutorial…',
  '/playground': 'Loading playground…',
  '/components': 'Loading components…',
}

const MIN_LOADER_MS = 420

let frameObserver = null
let loadingTimer = null
let loadingPath = null

function clearFrameObserver() {
  frameObserver?.disconnect()
  frameObserver = null
  if (loadingTimer) {
    window.clearTimeout(loadingTimer)
    loadingTimer = null
  }
}

function hideLoader(path) {
  if (loadingPath !== path) return
  if (nav.where().path !== path) return
  pageLoading.set(false)
  loadingPath = null
  clearFrameObserver()
}

function finishLoader(path, startedAt) {
  if (loadingPath !== path) return
  const wait = Math.max(0, MIN_LOADER_MS - (performance.now() - startedAt))
  if (loadingTimer) {
    window.clearTimeout(loadingTimer)
    loadingTimer = null
  }
  loadingTimer = window.setTimeout(() => {
    hideLoader(path)
  }, wait)
}

function watchFrameUntilReady(path) {
  clearFrameObserver()
  loadingPath = path
  const startedAt = performance.now()
  const frame = root.querySelector('[jacare-frame]')
  if (!(frame instanceof HTMLElement)) {
    hideLoader(path)
    return
  }

  const previous = frame.firstElementChild
  let ready = false

  function onReady() {
    if (ready) return
    ready = true
    frameObserver?.disconnect()
    frameObserver = null
    finishLoader(path, startedAt)
  }

  frameObserver = new MutationObserver(() => {
    if (nav.where().path !== path) return
    if (frame.childElementCount === 0) return
    if (previous && frame.firstElementChild === previous) return
    onReady()
  })
  frameObserver.observe(frame, { childList: true, subtree: false })

  // Already swapped to the new screen (warm/cache can be instant).
  queueMicrotask(() => {
    if (nav.where().path !== path) return
    if (frame.childElementCount === 0) return
    if (previous && frame.firstElementChild === previous) return
    onReady()
  })

  loadingTimer = window.setTimeout(() => {
    onReady()
  }, 10000)
}

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

const stopLoading = effect(() => {
  const path = nav.where().path
  const label = LAZY_LABELS[path]
  if (!label) {
    loadingPath = null
    pageLoading.set(false)
    clearFrameObserver()
    return
  }
  pageLoadingLabel.set(label)
  pageLoading.set(true)
  queueMicrotask(() => watchFrameUntilReady(path))
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
  if (href && LAZY_LABELS[href]) warmRoute(href)
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
    clearFrameObserver()
    document.removeEventListener('pointerenter', onPointerPrefetch, true)
    document.removeEventListener('focusin', onPointerPrefetch, true)
    stopLoading?.dispose?.()
    stopScrollTop?.dispose?.()
    stopReveal?.()
    stopProgress?.()
    dispose?.()
    dispose = null
  })
}
