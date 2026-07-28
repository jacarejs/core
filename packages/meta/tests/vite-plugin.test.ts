import { describe, expect, it, vi } from 'vitest'
import { resolve } from 'node:path'
import { jacareMeta, VIRTUAL_ROUTES_ID } from '../src/vite-plugin.js'

describe('jacareMeta', () => {
  it('resolves the virtual routes id', () => {
    const plugin = jacareMeta({ pagesDir: 'src/pages' })
    plugin.configResolved?.({ root: '/app' } as never)
    expect(plugin.resolveId?.(VIRTUAL_ROUTES_ID)).toBe('\0' + VIRTUAL_ROUTES_ID)
  })

  it('invalidates virtual routes when a page file is hot-updated', () => {
    const plugin = jacareMeta({ pagesDir: 'src/pages' })
    plugin.configResolved?.({ root: '/app' } as never)

    const virtualMod = { importers: new Set([{ id: '/app/src/nav.js' }]) }
    const invalidateModule = vi.fn()
    const server = {
      moduleGraph: {
        getModuleById: vi.fn(() => virtualMod),
        invalidateModule,
      },
      ws: { send: vi.fn() },
    }

    const result = plugin.handleHotUpdate?.({
      file: resolve('/app/src/pages/about.jcr'),
      server,
    } as never)

    expect(invalidateModule).toHaveBeenCalledWith(virtualMod)
    expect(result).toEqual([virtualMod, ...virtualMod.importers])
  })

  it('ignores hot updates outside pagesDir', () => {
    const plugin = jacareMeta({ pagesDir: 'src/pages' })
    plugin.configResolved?.({ root: '/app' } as never)

    const result = plugin.handleHotUpdate?.({
      file: resolve('/app/src/shell.jcr'),
      server: { moduleGraph: { getModuleById: vi.fn(), invalidateModule: vi.fn() } },
    } as never)

    expect(result).toBeUndefined()
  })

  it('watches pagesDir and reloads on add/unlink', () => {
    const plugin = jacareMeta({ pagesDir: 'src/pages' })
    plugin.configResolved?.({ root: '/app' } as never)

    const handlers: Record<string, (file: string) => void> = {}
    const virtualMod = { id: '\0' + VIRTUAL_ROUTES_ID }
    const invalidateModule = vi.fn()
    const send = vi.fn()
    const watcher = {
      add: vi.fn(),
      on: vi.fn((event: string, fn: (file: string) => void) => {
        handlers[event] = fn
      }),
    }

    plugin.configureServer?.({
      watcher,
      moduleGraph: {
        getModuleById: vi.fn(() => virtualMod),
        invalidateModule,
      },
      ws: { send },
    } as never)

    expect(watcher.add).toHaveBeenCalled()
    expect(handlers.add).toBeTypeOf('function')

    handlers.add!(resolve('/app/src/pages/new.jcr'))
    expect(invalidateModule).toHaveBeenCalledWith(virtualMod)
    expect(send).toHaveBeenCalledWith({ type: 'full-reload', path: '*' })
  })
})
