import { describe, expect, it } from 'vitest'
import { compile } from '../src/compile.js'
import { lowerComponent } from '../src/ir/lower-component.js'
import { parseTemplate } from '../src/parse-template.js'

describe('lower component', () => {
  const signals = new Set(['email', 'count'])

  it('classifies static, one-way, model, and event props', () => {
    const ast = parseTemplate(
      `<Field title="Hi" :label={'Email'} bind-value={email} on-change={save} />`,
    )
    const node = ast.children[0]!
    expect(node.type).toBe('component')
    if (node.type !== 'component') return
    const plan = lowerComponent(node, { signals })
    expect(plan.props).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'title', mode: 'static', raw: 'Hi' }),
        expect.objectContaining({
          name: 'label',
          mode: 'one-way',
          lazy: false,
          raw: "'Email'",
        }),
        expect.objectContaining({ name: 'value', mode: 'model', raw: 'email' }),
        expect.objectContaining({ name: 'change', mode: 'event', raw: 'save' }),
      ]),
    )
  })

  it('marks call exprs as lazy one-way props', () => {
    const ast = parseTemplate(`<Badge :label={t('home.lead')} :count={count} />`)
    const node = ast.children[0]!
    expect(node.type).toBe('component')
    if (node.type !== 'component') return
    const plan = lowerComponent(node, { signals })
    const label = plan.props.find((p) => p.name === 'label')
    const count = plan.props.find((p) => p.name === 'count')
    expect(label?.lazy).toBe(true)
    expect(count?.lazy).toBe(false)
    expect(count?.source).toEqual({ kind: 'signal', name: 'count', local: true })
  })

  it('emits lazy thunk for reactive call props', () => {
    const result = compile(
      `import Badge from './Badge.jcr'
       import { signal } from '@jacare/core'
       const t = (k) => k
       const count = signal(0)
       export <view>
         <Badge :label=\${t('home')} :count=\${count} />
       </view>`,
    )
    expect(result.code).toContain('label: () => (t(\'home\'))')
    expect(result.code).toContain('count: count')
  })

  it('compiles slots via component plan', () => {
    const result = compile(
      `import Card from './Card.jcr'
       export <view>
         <Card title="Stats">
           <p>body</p>
         </Card>
       </view>`,
    )
    expect(result.code).toContain('children:')
    expect(result.code).toContain('title: "Stats"')
    expect(result.code).toContain('runUntracked')
  })

  it('passes props into SSR render()', () => {
    const result = compile(
      `import Card from './Card.jcr'
       export <view>
         <Card title="Hello" :n=\${1} />
       </view>`,
      { mode: 'server' },
    )
    expect(result.code).toContain('Card.render({ title: "Hello", n: 1 })')
  })
})
