import { flattenViewLiteral } from './flatten-literal.js'
import { flattenViewBlock } from './flatten-view-block.js'
import { flattenStyleBlock } from './flatten-style-block.js'
import { JacareCompileError } from './errors.js'

export interface ParsedModule {
  code: string
  viewHtml: string | null
  styleCss: string | null
  styleLang: string | null
  viewStartLine: number
  viewEndLine: number
  moduleLineMap: number[]
}

const SFC_SCRIPT_RE = /<script(?:\s[^>]*)?>/i
const EXPORT_VIEW_RE = /export\s+default\s+view\s*`/
const VIEW_RE = /\bview\s*`/
const EXPORT_VIEW_BLOCK_RE = /export(?:\s+default)?\s+<view\b/i
const RETURN_VIEW_BLOCK_RE = /\breturn\s+<view\b/i
const EXPORT_STYLE_BLOCK_RE = /export\s+<style\b/i
const STYLE_RE = /\bstyle\s*`/

interface LocatedView {
  html: string
  removeStart: number
  removeEnd: number
  viewStartLine: number
  viewEndLine: number
}

interface LocatedStyle {
  css: string
  lang: string | null
  removeStart: number
  removeEnd: number
  styleStartLine: number
  styleEndLine: number
}

export function hasViewSource(source: string): boolean {
  return (
    /\bview\s*`/.test(source) ||
    /<view[\s>]/.test(source) ||
    /export\s+<view\b/i.test(source)
  )
}

export function parseModule(source: string, filename?: string): ParsedModule {
  if (SFC_SCRIPT_RE.test(source)) {
    throw new JacareCompileError(
      'Jacaré: <script>/<template> blocks are no longer supported. Write plain JavaScript with export <view>...</view> or view`...`.',
      {
        ...(filename ? { filename } : {}),
        line: 1,
        column: 1,
        source,
      },
    )
  }

  const located = locateView(source, filename)
  if (!located) {
    throw new JacareCompileError(
      'Jacaré: expected export <view>...</view>, view`...`, or <view>...</view> template',
      {
        ...(filename ? { filename } : {}),
        line: 1,
        column: 1,
        source,
      },
    )
  }

  const styleLocated = locateStyle(source, filename)
  const removeRanges: Array<{ start: number; end: number }> = [
    { start: located.removeStart, end: located.removeEnd },
  ]
  if (styleLocated) {
    removeRanges.push({ start: styleLocated.removeStart, end: styleLocated.removeEnd })
  }

  removeRanges.sort((a, b) => b.start - a.start)
  let code = source
  for (const range of removeRanges) {
    code = code.slice(0, range.start) + code.slice(range.end)
  }

  const moduleLineMap = buildModuleLineMap(source, removeRanges)

  return {
    code: code.trim(),
    viewHtml: located.html,
    styleCss: styleLocated?.css ?? null,
    styleLang: styleLocated?.lang ?? null,
    viewStartLine: located.viewStartLine,
    viewEndLine: located.viewEndLine,
    moduleLineMap,
  }
}

function locateStyle(source: string, filename?: string): LocatedStyle | null {
  const exportBlock = EXPORT_STYLE_BLOCK_RE.exec(source)
  if (exportBlock) {
    const openIndex = source.indexOf('<style', exportBlock.index)
    if (openIndex >= 0) {
      const flat = flattenStyleBlock(source, openIndex, filename)
      return {
        css: flat.css,
        lang: flat.lang,
        removeStart: exportBlock.index,
        removeEnd: flat.end,
        styleStartLine: lineAt(source, exportBlock.index),
        styleEndLine: lineAt(source, flat.end),
      }
    }
  }

  const styleMatch = STYLE_RE.exec(source)
  if (styleMatch) {
    const styleBacktick = styleMatch.index + styleMatch[0].length - 1
    const styleFlat = flattenViewLiteral(source, styleBacktick, filename)
    return {
      css: styleFlat.html,
      lang: null,
      removeStart: styleMatch.index,
      removeEnd: styleFlat.end,
      styleStartLine: lineAt(source, styleMatch.index),
      styleEndLine: lineAt(source, styleFlat.end),
    }
  }

  return null
}

function locateView(source: string, filename?: string): LocatedView | null {
  const exportLiteral = EXPORT_VIEW_RE.exec(source)
  if (exportLiteral) {
    const backtick = exportLiteral.index + exportLiteral[0].length - 1
    const flat = flattenViewLiteral(source, backtick, filename)
    return {
      html: flat.html,
      removeStart: exportLiteral.index,
      removeEnd: flat.end,
      viewStartLine: lineAt(source, exportLiteral.index),
      viewEndLine: lineAt(source, flat.end),
    }
  }

  const exportBlock = EXPORT_VIEW_BLOCK_RE.exec(source)
  if (exportBlock) {
    const openIndex = source.indexOf('<view', exportBlock.index)
    if (openIndex >= 0) {
      const flat = flattenViewBlock(source, openIndex, filename)
      return {
        html: flat.html,
        removeStart: exportBlock.index,
        removeEnd: flat.end,
        viewStartLine: lineAt(source, exportBlock.index),
        viewEndLine: lineAt(source, flat.end),
      }
    }
  }

  const returnBlock = RETURN_VIEW_BLOCK_RE.exec(source)
  if (returnBlock) {
    const openIndex = source.indexOf('<view', returnBlock.index)
    if (openIndex >= 0) {
      const flat = flattenViewBlock(source, openIndex, filename)
      return {
        html: flat.html,
        removeStart: returnBlock.index,
        removeEnd: flat.end,
        viewStartLine: lineAt(source, returnBlock.index),
        viewEndLine: lineAt(source, flat.end),
      }
    }
  }

  const viewLiteral = VIEW_RE.exec(source)
  if (viewLiteral) {
    const backtick = viewLiteral.index + viewLiteral[0].length - 1
    const flat = flattenViewLiteral(source, backtick, filename)
    return {
      html: flat.html,
      removeStart: viewLiteral.index,
      removeEnd: flat.end,
      viewStartLine: lineAt(source, viewLiteral.index),
      viewEndLine: lineAt(source, flat.end),
    }
  }

  return null
}

function lineAt(source: string, index: number): number {
  return source.slice(0, index).split('\n').length
}

function buildModuleLineMap(
  source: string,
  ranges: Array<{ start: number; end: number }>,
): number[] {
  const lines = source.split('\n')
  const excluded = new Set<number>()
  for (const range of ranges) {
    const startLine = lineAt(source, range.start)
    const endLine = lineAt(source, range.end)
    for (let line = startLine; line <= endLine; line++) {
      excluded.add(line)
    }
  }
  const map: number[] = []
  for (let line = 1; line <= lines.length; line++) {
    if (!excluded.has(line)) {
      map.push(line)
    }
  }
  return map
}

export { findViewTemplates } from './flatten-literal.js'
