import { createBag, pulse } from '@jacare/core'

/** How many times the lab-lazy factory has run (module-level; import is cheap). */
export const lazyFactoryRuns = pulse(0)

/**
 * Heavy work stays inside the factory — createBag only registers the id.
 * First property read publishes cells on the mesh.
 */
export const lazyBag = createBag('lab-lazy', () => {
  lazyFactoryRuns.update((n) => n + 1)
  const label = pulse('published')
  const ticks = pulse(0)
  function bump() {
    ticks.update((n) => n + 1)
  }
  return { label, ticks, bump }
})
