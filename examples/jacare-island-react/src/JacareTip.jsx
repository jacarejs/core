import { useEffect, useRef } from 'react'
import { mountIsland } from '@jacare/core/island'
import TipIsland from './islands/TipIsland.jcr'

export function JacareTip({ topic = 'islands' }) {
  const hostRef = useRef(null)
  const islandRef = useRef(null)

  useEffect(() => {
    const el = hostRef.current
    if (!el) return undefined
    const island = mountIsland(el, TipIsland, {
      props: { topic },
      shadow: true,
    })
    islandRef.current = island
    return () => {
      island()
      islandRef.current = null
    }
  }, [])

  useEffect(() => {
    islandRef.current?.update({ topic })
  }, [topic])

  return <div ref={hostRef} className="island-host" />
}
