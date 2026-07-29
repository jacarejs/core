import * as vscode from 'vscode'
import { JacareDiagnostics } from './diagnostics/diagnostics.js'
import { createMeshDefinitionProvider } from './mesh/definition.js'
import { createMeshHoverProvider } from './mesh/hover.js'
import { WorkspaceBagIndex } from './mesh/workspace-index.js'

const LAB_BASE = 'https://jacarejs.github.io/core/lab/#'

type LabLesson = {
  path: string
  label: string
  keywords: string[]
}

const LESSONS: LabLesson[] = [
  { path: '/quick-start', label: 'Quick start', keywords: ['quick', 'start', 'install'] },
  { path: '/module', label: 'Module', keywords: ['module', 'export', 'view', 'contract', 'style'] },
  { path: '/typescript', label: 'TypeScript', keywords: ['typescript', 'jacare-ts', '@jacare-ts', 'jcr.ts'] },
  { path: '/language', label: 'Language', keywords: ['language', 'syntax', 'directive'] },
  { path: '/binding-ir', label: 'Binding IR', keywords: ['binding-ir', 'ir', 'x-ray'] },
  { path: '/reactivity', label: 'Reactivity', keywords: ['reactivity', 'pulse', 'signal', 'derive', 'computed', 'effect', 'watch', 'batch', 'untrack', 'patience', 'flushsync'] },
  { path: '/bag', label: 'Pulse bags', keywords: ['bag', 'createbag', 'getbag', 'ripple', 'mesh', '@'] },
  { path: '/templates', label: 'Templates', keywords: ['templates', 'template'] },
  { path: '/bindings', label: 'Bindings', keywords: ['bindings', 'bind-value', 'bind-text', 'class-', 'class:', 'style---', 'style:'] },
  { path: '/events', label: 'Events', keywords: ['events', 'on-click', 'emit'] },
  { path: '/debug', label: 'Debug', keywords: ['debug', '<debug'] },
  { path: '/why', label: 'Why', keywords: ['why', 'whychain', 'reactivecycleerror'] },
  { path: '/if', label: 'If', keywords: ['#if', 'elif', 'else', 'jacare-when', 'when'] },
  { path: '/case', label: 'Case', keywords: ['#case', '#when'] },
  { path: '/for', label: 'For', keywords: ['#for', 'list', 'keyed'] },
  { path: '/components', label: 'Components', keywords: ['components', 'props', 'slots', 'field'] },
  { path: '/css', label: 'Scoped CSS', keywords: ['css', 'scoped', 'export <style>'] },
  { path: '/nav', label: 'Navigation', keywords: ['nav', 'createnav', 'lazy', 'screen', 'createroute', 'router', 'focus'] },
  { path: '/forms', label: 'Forms', keywords: ['forms', 'createform', 'a11y', 'aria', 'alert'] },
  { path: '/lifecycle', label: 'Lifecycle', keywords: ['lifecycle', 'createlifecycle'] },
  { path: '/cookbook', label: 'Cookbook', keywords: ['cookbook', 'recipe'] },
  { path: '/playground', label: 'Playground', keywords: ['playground'] },
  { path: '/ssr', label: 'SSR', keywords: ['ssr', 'rendertostring', 'renderToStream'] },
  { path: '/island', label: 'Islands', keywords: ['island', 'mountisland'] },
  { path: '/tooling', label: 'Tooling', keywords: ['tooling', 'cli', 'check', 'vite', 'devtools', 'vscode'] },
  { path: '/helpers', label: 'Import catalog', keywords: ['helpers', 'import', 'catalog', 'api'] },
]

function normalizeToken(raw: string): string {
  return raw.trim().toLowerCase().replace(/^\$\{/, '').replace(/\}$/, '')
}

function lessonForToken(token: string): LabLesson | undefined {
  const key = normalizeToken(token)
  if (!key) return undefined

  for (const lesson of LESSONS) {
    if (lesson.keywords.some((kw) => key === kw || key.startsWith(kw) || kw.startsWith(key))) {
      return lesson
    }
  }

  if (key.startsWith('#')) {
    const bare = key.slice(1)
    return LESSONS.find((l) => l.keywords.some((kw) => kw === `#${bare}` || kw === bare))
  }

  if (key.startsWith('@')) return LESSONS.find((l) => l.path === '/bag')
  if (key.startsWith('bind')) return LESSONS.find((l) => l.path === '/bindings')
  if (key.startsWith('on-') || key.startsWith('@click')) return LESSONS.find((l) => l.path === '/events')
  if (key.startsWith('class') || key.startsWith('style')) return LESSONS.find((l) => l.path === '/bindings')

  return undefined
}

function wordAtCursor(editor: vscode.TextEditor): string {
  const position = editor.selection.active
  const range = editor.document.getWordRangeAtPosition(
    position,
    /@[A-Za-z_$][\w$-]*\/[A-Za-z_$][\w$]*|[#@]?[\w:-]+/,
  )
  return range ? editor.document.getText(range) : ''
}

async function openLabLesson(): Promise<void> {
  const editor = vscode.window.activeTextEditor
  const token = editor ? wordAtCursor(editor) : ''
  const matched = token ? lessonForToken(token) : undefined

  if (matched) {
    await vscode.env.openExternal(vscode.Uri.parse(`${LAB_BASE}${matched.path}`))
    return
  }

  const picked = await vscode.window.showQuickPick(
    LESSONS.map((lesson) => ({
      label: lesson.label,
      description: lesson.path,
      lesson,
    })),
    {
      placeHolder: token
        ? `No Lab lesson for “${token}” — pick a lesson`
        : 'Open Jacaré Lab lesson',
      matchOnDescription: true,
    },
  )

  if (!picked) return
  await vscode.env.openExternal(vscode.Uri.parse(`${LAB_BASE}${picked.lesson.path}`))
}

export function activate(context: vscode.ExtensionContext): void {
  const bags = new WorkspaceBagIndex()
  bags.watch(context)
  void bags.refresh()

  const diagnostics = new JacareDiagnostics()
  diagnostics.activate(context)

  const selector: vscode.DocumentSelector = { language: 'jacare' }

  context.subscriptions.push(
    vscode.commands.registerCommand('jacare.openLabLesson', openLabLesson),
    vscode.languages.registerHoverProvider(selector, createMeshHoverProvider(() => bags.get())),
    vscode.languages.registerDefinitionProvider(
      selector,
      createMeshDefinitionProvider(() => bags.get()),
    ),
  )
}

export function deactivate(): void {}
