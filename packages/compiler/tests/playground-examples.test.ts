import { describe, expect, it } from 'vitest'
import {
  DEFAULT_PLAYGROUND_SOURCE,
  PLAYGROUND_EXAMPLES,
} from '../../../examples/jacare-lab/src/playground/examples.js'
import { runPlayground } from '../../../examples/jacare-lab/src/playground/run.js'
import { STUDIO_EXAMPLES } from '../../../examples/jacare-studio/src/lib/examples.js'
import { runPlayground as runStudio } from '../../../examples/jacare-studio/src/lib/run.js'

describe('Lab playground examples', () => {
  it('mounts the default source', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const dispose = runPlayground(host, DEFAULT_PLAYGROUND_SOURCE)
    expect(host.textContent).toMatch(/0|\+1|Reset/)
    dispose?.()
    host.remove()
  })

  it.each(PLAYGROUND_EXAMPLES.map((example) => [example.id, example.source]))(
    'mounts example %s',
    (_id, source) => {
      const host = document.createElement('div')
      document.body.appendChild(host)
      const dispose = runPlayground(host, source)
      expect(host.childNodes.length).toBeGreaterThan(0)
      dispose?.()
      host.remove()
    },
  )

  it('supports @route sugar via getRouteParam', () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const dispose = runPlayground(
      host,
      `export <view>
  <p id="route">\${@route/id}</p>
</view>
`,
    )
    expect(host.querySelector('#route')).toBeTruthy()
    dispose?.()
    host.remove()
  })
})

describe('Studio playground examples', () => {
  it.each(
    STUDIO_EXAMPLES.map((example) => [
      example.id,
      example.files ?? [{ name: 'App.jcr', source: example.source }],
    ]),
  )('mounts example %s', (_id, files) => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const dispose = runStudio(host, files, files[0].name)
    expect(host.childNodes.length).toBeGreaterThan(0)
    dispose?.()
    host.remove()
  })
})
