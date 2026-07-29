import { useEffect, useRef } from 'react'
import { mountIsland } from '@jacare/core/island'
import CounterIsland from './islands/CounterIsland.jcr'

export function JacareCounter({ start = 0, label = 'Clicks' }) {
  const hostRef = useRef(null)
  const islandRef = useRef(null)

  useEffect(() => {
    const el = hostRef.current
    if (!el) return undefined
    const island = mountIsland(el, CounterIsland, {
      props: { start, label },
    })
    islandRef.current = island
    return () => {
      island()
      islandRef.current = null
    }
  }, [])

  useEffect(() => {
    islandRef.current?.update({ start, label })
  }, [start, label])

  return <div ref={hostRef} className="island-host" />
}
