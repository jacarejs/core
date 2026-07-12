import { JacareCompileError } from './errors.js'

const STYLE_CLOSE_RE = /^<\/style\s*>/i
const LANG_RE = /\blang\s*=\s*(?:"([^"]*)"|'([^']*)')/i

export interface FlattenedStyle {
  css: string
  lang: string | null
  start: number
  end: number
}

export function flattenStyleBlock(
  source: string,
  openIndex: number,
  filename?: string,
): FlattenedStyle {
  if (!source.slice(openIndex).toLowerCase().startsWith('<style')) {
    throw new JacareCompileError('Jacaré: expected <style> block', {
      ...(filename ? { filename } : {}),
      line: lineAt(source, openIndex),
      column: columnAt(source, openIndex),
      source,
    })
  }

  const openTagEnd = source.indexOf('>', openIndex)
  if (openTagEnd < 0) {
    throw new JacareCompileError('Jacaré: unclosed <style> opening tag', {
      ...(filename ? { filename } : {}),
      line: lineAt(source, openIndex),
      column: columnAt(source, openIndex),
      source,
    })
  }

  const openTag = source.slice(openIndex, openTagEnd + 1)
  const langMatch = LANG_RE.exec(openTag)
  const lang = langMatch?.[1] ?? langMatch?.[2] ?? null

  let pos = openTagEnd + 1
  let css = ''

  while (pos < source.length) {
    const close = STYLE_CLOSE_RE.exec(source.slice(pos))
    if (close?.index === 0) {
      return { css: css.trim(), lang, start: openIndex, end: pos + close[0].length }
    }

    css += source[pos]!
    pos++
  }

  throw new JacareCompileError('Jacaré: unclosed <style> block', {
    ...(filename ? { filename } : {}),
    line: lineAt(source, openIndex),
    column: columnAt(source, openIndex),
    source,
  })
}

function lineAt(source: string, index: number): number {
  return source.slice(0, index).split('\n').length
}

function columnAt(source: string, index: number): number {
  const before = source.slice(0, index)
  return index - before.lastIndexOf('\n')
}
