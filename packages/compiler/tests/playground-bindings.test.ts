import { describe, expect, it } from 'vitest'
import {
  PLAYGROUND_USER_RUNTIME,
  RUNTIME_IMPORT_ORDER,
  playgroundRuntimeBindings,
} from '../src/codegen.js'

describe('playgroundRuntimeBindings', () => {
  it('includes every compiler runtime import (e.g. getRouteParam)', () => {
    const list = playgroundRuntimeBindings()
    for (const name of RUNTIME_IMPORT_ORDER) {
      expect(list.split(', ')).toContain(name)
    }
    expect(list).toContain('getRouteParam')
  })

  it('includes common user APIs used in demos', () => {
    const names = playgroundRuntimeBindings().split(', ')
    for (const name of PLAYGROUND_USER_RUNTIME) {
      expect(names).toContain(name)
    }
  })

  it('accepts extra bindings', () => {
    expect(playgroundRuntimeBindings(['mountIsland'])).toContain('mountIsland')
  })
})
