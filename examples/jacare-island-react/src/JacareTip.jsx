import { useEffect, useRef } from 'react'
import { mountIsland } from '@jacare/core/island'
import TipIsland from './islands/TipIsland.jcr'

export function JacareTip({ topic = 'islands' }) {
  const hostRef = useRef(null)

  useEffect(() => {
    const el = hostRef.current
    if (!el) return undefined
    return mountIsland(el, TipIsland, {
      props: { topic },
      shadow: true,
    })
  }, [topic])

  return <div ref={hostRef} className="island-host" />
}
