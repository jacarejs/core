/** Binding IR — source classification (Fatia 0+). */

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
