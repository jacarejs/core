/** Binding IR — source + leaf ops. */

/** Where a reactive value comes from — classified once in lower. */
export type BindingSource =
  | { kind: 'signal'; name: string; local: boolean }
  | { kind: 'prop'; name: string }
  | { kind: 'expr'; code: string; arrow: boolean }
  | { kind: 'static'; value: string }

export interface LowerSourceContext {
  signals?: ReadonlySet<string> | undefined
  importedNames?: ReadonlySet<string> | undefined
  componentProps?: ReadonlySet<string> | undefined
}

export type LowerSourceOptions = {
  /**
   * Bare identifier that is both a component prop and a known name:
   * - `true` — prefer prop (text `${title}` sites)
   * - `false` (default) — prefer signal / import (attr sites)
   */
  preferProp?: boolean
}

export type LowerLeafContext = LowerSourceContext & { cpw: boolean }

/** Client apply strategy — CPW is a mode; backend activates when options.cpw. */
export type ClientMode =
  | 'bindText'
  | 'bindPropText'
  | 'bindAttribute'
  | 'bindClass'
  | 'bindStyleVar'
  | 'bindModel'
  | 'effect'
  | 'cpw'
  | 'once'

export type MixedTextPart =
  | { type: 'static'; value: string }
  | { type: 'expr'; source: BindingSource; raw: string }

/** Leaf binding ops — no control flow / components yet. */
export type LeafBindingOp =
  | {
      op: 'staticAttr'
      name: string
      value: string
    }
  | {
      op: 'setClassName'
      code: string
    }
  | {
      op: 'text'
      source: BindingSource
      mode: Extract<ClientMode, 'bindText' | 'bindPropText' | 'effect' | 'cpw'>
      mixed?: false
    }
  | {
      op: 'text'
      mode: 'effect'
      mixed: true
      parts: MixedTextPart[]
    }
  | {
      op: 'attr'
      name: string
      source: BindingSource
      mode: Extract<ClientMode, 'bindAttribute' | 'effect' | 'cpw' | 'once'>
    }
  | {
      op: 'classToggle'
      className: string
      source: BindingSource
      mode: Extract<ClientMode, 'bindClass' | 'effect' | 'cpw'>
    }
  | {
      op: 'styleVar'
      cssVar: string
      source: BindingSource
      mode: Extract<ClientMode, 'bindStyleVar' | 'effect' | 'cpw'>
    }
  | {
      op: 'model'
      prop: 'value' | 'checked'
      source: BindingSource
      mode: Extract<ClientMode, 'bindModel' | 'effect'>
    }
  | {
      op: 'event'
      name: string
      handler: string
    }

export type LoweredText =
  | { kind: 'skip' }
  | { kind: 'static'; value: string }
  | { kind: 'binding'; op: Extract<LeafBindingOp, { op: 'text' }> }
