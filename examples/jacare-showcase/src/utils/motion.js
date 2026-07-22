const reduced =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function initReveal() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {}

  const nodes = Array.from(document.querySelectorAll('[data-reveal]:not(.is-revealed)'))
  if (nodes.length === 0) return () => {}

  if (reduced || !('IntersectionObserver' in window)) {
    nodes.forEach((node) => node.classList.add('is-revealed'))
    return () => {}
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-revealed')
        observer.unobserve(entry.target)
      }
    },
    { threshold: 0.08, rootMargin: '0px 0px -4% 0px' },
  )

  nodes.forEach((node) => {
    const rect = node.getBoundingClientRect()
    const vh = window.innerHeight || document.documentElement.clientHeight
    if (rect.top < vh * 0.92 && rect.bottom > 0) {
      node.classList.add('is-revealed')
      return
    }
    observer.observe(node)
  })

  return () => {
    observer.disconnect()
  }
}

function scrollToProgress(pct) {
  const max = document.documentElement.scrollHeight - window.innerHeight
  const top = Math.max(0, (Math.min(100, pct) / 100) * max)
  window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' })
}

export function initPageProgress() {
  if (typeof window === 'undefined') return () => {}

  const root = document.querySelector('[data-page-progress]')
  if (!root) return () => {}

  const fillTop = root.querySelector('[data-progress-fill-top]')
  const glowTop = root.querySelector('[data-progress-glow-top]')
  const fillRail = root.querySelector('[data-progress-fill-rail]')
  const orb = root.querySelector('[data-progress-orb]')
  const label = root.querySelector('[data-progress-label]')
  const dots = Array.from(root.querySelectorAll('[data-progress-dot]'))

  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const raw = max > 0 ? (window.scrollY / max) * 100 : 0
    const pct = Math.min(100, Math.max(0, raw))
    const rounded = Math.round(pct)

    root.style.setProperty('--progress', pct + '%')
    root.style.setProperty('--progress-n', String(pct / 100))
    root.classList.toggle('is-active', window.scrollY > 8)
    root.classList.toggle('is-complete', pct >= 99.5)

    if (fillTop) fillTop.style.width = pct + '%'
    if (glowTop) glowTop.style.left = pct + '%'
    if (fillRail) fillRail.style.height = pct + '%'
    if (orb) orb.style.top = pct + '%'
    if (label) label.textContent = rounded + '%'

    dots.forEach((dot) => {
      const mark = Number(dot.getAttribute('data-progress-dot') || 0)
      dot.classList.toggle('is-passed', pct >= mark - 0.5)
      dot.classList.toggle('is-current', Math.abs(pct - mark) < 8 || (mark === 100 && pct > 92))
    })
  }

  let frame = 0
  function onScroll() {
    if (frame) return
    frame = window.requestAnimationFrame(() => {
      frame = 0
      update()
    })
  }

  function onDotClick(event) {
    const target = event.currentTarget
    const mark = Number(target.getAttribute('data-progress-dot') || 0)
    scrollToProgress(mark)
  }

  dots.forEach((dot) => dot.addEventListener('click', onDotClick))
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)

  return () => {
    if (frame) window.cancelAnimationFrame(frame)
    dots.forEach((dot) => dot.removeEventListener('click', onDotClick))
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
  }
}
