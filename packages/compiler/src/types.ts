export interface CompileOptions {
  filename?: string
  runtimeImport?: string
  viewStartLine?: number
  mode?: 'client' | 'server' | 'full'
  scopeId?: string
  cpw?: boolean
  debug?: boolean
}

export interface CompileResult {
  code: string
  script: string
  template: string
  props: string[]
  contract?: import('./parse-contract.js').TemplateContract
  scopeId?: string
  scopedStyle?: string
  styleLang?: string | null
  map?: import('source-map-js').RawSourceMap
}

export interface JacareBlock {
  script: string
  template: string
}

export type TextPart =
  | { type: 'static'; value: string }
  | { type: 'expr'; value: string }

export interface TemplateTextNode {
  type: 'text'
  parts: TextPart[]
}

export interface TemplateAttr {
  name: string
  kind: 'static' | 'bind' | 'event' | 'class' | 'prop' | 'expr' | 'style'
  value: string
}

export interface TemplateElementNode {
  type: 'element'
  tag: string
  attrs: TemplateAttr[]
  children: TemplateNode[]
  selfClosing: boolean
  sourceLine?: number
}

export interface TemplateComponentNode {
  type: 'component'
  name: string
  attrs: TemplateAttr[]
  children: TemplateNode[]
  selfClosing: boolean
}

export interface TemplateSlotNode {
  type: 'slot'
  name?: string
  sourceLine?: number
}

export interface TemplateIfBranch {
  condition: string
  children: TemplateNode[]
}

export interface TemplateIfNode {
  type: 'if'
  branches: TemplateIfBranch[]
  elseChildren: TemplateNode[]
  sourceLine?: number
}

export interface TemplateCaseBranch {
  value: string
  children: TemplateNode[]
}

export interface TemplateCaseNode {
  type: 'case'
  scrutinee: string
  branches: TemplateCaseBranch[]
  elseChildren: TemplateNode[]
  sourceLine?: number
}

export interface TemplateEachNode {
  type: 'each'
  source: string
  itemName: string
  indexName?: string
  keyExpr?: string
  children: TemplateNode[]
  sourceLine?: number
}

export interface TemplateDebugNode {
  type: 'debug'
  expr: string
  label?: string
  copy?: boolean
  sourceLine?: number
}

export type TemplateNode =
  | TemplateTextNode
  | TemplateElementNode
  | TemplateComponentNode
  | TemplateSlotNode
  | TemplateIfNode
  | TemplateCaseNode
  | TemplateEachNode
  | TemplateDebugNode

export interface TemplateAST {
  children: TemplateNode[]
}
