import { useEffect, useRef } from 'react'
import { mountIsland } from '@jacare/core/island'
import CounterIsland from './islands/CounterIsland.jcr'

export function JacareCounter({ start = 0, label = 'Clicks' }) {
  const hostRef = useRef(null)

  useEffect(() => {
    const el = hostRef.current
    if (!el) return undefined
    return mountIsland(el, CounterIsland, {
      props: { start, label },
    })
  }, [start, label])

  return <div ref={hostRef} className="island-host" />
}
