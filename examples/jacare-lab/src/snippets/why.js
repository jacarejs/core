export const consoleWhyCode = `// With DevTools connected:
$why($0)              // selected element
$why(count)           // pulse
$why('@cart/count')   // mesh address
$why.last()           // last write

// Same object everywhere:
import { why, formatWhyChain } from '@jacare/core'
console.log(formatWhyChain(why(el)))`

export const cliWhyCode = `$ jacare why src/pages/why.jcr:42
why src/pages/why.jcr:42 ?
│
└─ bind text · count · bindText · signal   src/pages/why.jcr:42`

export const cycleWhyCode = `enableDevtools()
// …effect that writes what it reads…
// ReactiveCycleError: reactive cycle detected …
//
// why:
// why ReactiveCycleError ?
// │
// ├─ pulse a = …
// └─ …`
