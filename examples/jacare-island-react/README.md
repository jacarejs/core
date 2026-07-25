# Jacaré Island × React

Embed Jacaré `.jcr` widgets inside a **React** host via `mountIsland`.

## Run

```bash
yarn island-react:dev
# http://localhost:3007
```

```bash
yarn island-react:build
```

## Pattern

```jsx
import { useEffect, useRef } from 'react'
import { mountIsland } from '@jacare/core/island'
import CounterIsland from './islands/CounterIsland.jcr'

export function JacareCounter({ start, label }) {
  const hostRef = useRef(null)

  useEffect(() => {
    if (!hostRef.current) return
    return mountIsland(hostRef.current, CounterIsland, {
      props: { start, label },
    })
  }, [start, label])

  return <div ref={hostRef} />
}
```

Vite config combines `@vitejs/plugin-react` + `jacare()` from `@jacare/vite-plugin`.

Docs: [docs/island.md](../../docs/island.md)
