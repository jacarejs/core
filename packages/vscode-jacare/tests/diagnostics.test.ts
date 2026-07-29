import { describe, expect, it } from 'vitest'
import { collectCompileDiagnostics } from '../src/diagnostics/collect.js'

describe('collectCompileDiagnostics', () => {
  it('returns no diagnostics for a valid module', () => {
    const source = `import { pulse } from '@jacare/core'
const count = pulse(0)
export <view>
  <span>\${count}</span>
</view>
`
    expect(collectCompileDiagnostics(source, 'ok.jcr')).toEqual([])
  })

  it('maps compile errors to 0-based ranges', () => {
    const source = `import { pulse } from '@jacare/core'
export <view>
  <div>
  #end
</view>
`
    const items = collectCompileDiagnostics(source, '/app/broken.jcr')
    expect(items).toHaveLength(1)
    expect(items[0]!.message.length).toBeGreaterThan(0)
    expect(items[0]!.line).toBeGreaterThanOrEqual(0)
    expect(items[0]!.column).toBeGreaterThanOrEqual(0)
  })
})
