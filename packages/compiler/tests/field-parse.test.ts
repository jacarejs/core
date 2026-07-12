import { describe, expect, it } from 'vitest'
import { compile } from '../src/compile.js'
import { parseModule } from '../src/parse-module.js'
import { parseTemplate } from '../src/parse-template.js'

describe('Field component parsing', () => {
  it('flattens and parses a self-closing Field tag', () => {
    const source = `import { view } from '@jacare/core'
import Field from './Field.jcr'
export default view\`
  <Field :label={label} />
\``
    const parsed = parseModule(source)
    expect(parsed.viewHtml).toContain('<Field')
    expect(() => parseTemplate(parsed.viewHtml!)).not.toThrow()
  })

  it('parses Field with dotted field prop', () => {
    const source = `import { view } from '@jacare/core'
import Field from './Field.jcr'
const form = { fields: { name: () => '' } }
export default view\`
  <Field :field=\${form.fields.name} />
\``
    expect(() => compile(source)).not.toThrow()
  })

  it('parses Field with spaced placeholder', () => {
    const source = `import { view } from '@jacare/core'
import Field from './Field.jcr'
export default view\`
  <Field :placeholder=\${'Your name'} />
\``
    expect(() => compile(source)).not.toThrow()
  })
})
