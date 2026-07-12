import { describe, expect, it } from 'vitest'
import { compile, JacareCompileError } from '@jacare/compiler'

describe('JacareCompileError', () => {
  it('includes filename and line for template errors', () => {
    const source = `import { view } from '@jacare/core'
export default view\`
<div>
#end
\``

    try {
      compile(source, { filename: '/app/tasks.jcr' })
      expect.unreachable('should throw')
    } catch (error) {
      expect(error).toBeInstanceOf(JacareCompileError)
      const compileError = error as JacareCompileError
      expect(compileError.filename).toBe('/app/tasks.jcr')
      expect(compileError.line).toBeGreaterThan(1)
      expect(compileError.message).toContain('/app/tasks.jcr')
    }
  })
})

describe('source maps', () => {
  it('emits mappings back to the .jcr file', () => {
    const source = `import { signal, view } from '@jacare/core'
const count = signal(0)
export default view\`
  <div>\${count}</div>
\``

    const result = compile(source, { filename: 'app.jcr' })
    expect(result.map).toBeDefined()
    expect(result.map?.sources).toContain('app.jcr')
    expect(result.map?.mappings?.length).toBeGreaterThan(0)
  })
})
