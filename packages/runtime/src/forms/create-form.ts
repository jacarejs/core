import { computed } from '../computed.js'
import { effect } from '../effect.js'
import { signal } from '../signal.js'
import type { Computed, ReadonlySignal, Signal } from '../types.js'

export type FormValidator<T> = (value: T) => string | null | undefined | false

export interface FieldDef<T> {
  value: T
  validate?: FormValidator<T> | FormValidator<T>[]
}

export interface FormField<T> extends Signal<T> {
  readonly error: ReadonlySignal<string | undefined>
  readonly touched: ReadonlySignal<boolean>
  readonly dirty: ReadonlySignal<boolean>
  blur(): void
  validate(): boolean
}

export type FormFields<T extends Record<string, FieldDef<unknown>>> = {
  [K in keyof T]: FormField<T[K]['value']>
}

export type FormValues<T extends Record<string, FieldDef<unknown>>> = {
  [K in keyof T]: T[K]['value']
}

export interface Form<T extends Record<string, FieldDef<unknown>>> {
  fields: FormFields<T>
  readonly values: Computed<FormValues<T>>
  readonly valid: Computed<boolean>
  readonly dirty: Computed<boolean>
  validate(): boolean
  reset(): void
  handleSubmit(
    onValid: (values: FormValues<T>) => void | Promise<void>,
  ): (event: Event) => void
}

function normalizeValidators<T>(validate: FieldDef<T>['validate']): FormValidator<T>[] {
  if (!validate) return []
  return Array.isArray(validate) ? validate : [validate]
}

function createField<T>(def: FieldDef<T>): { field: FormField<T>; reset: () => void } {
  const value = signal(def.value)
  let initial = def.value
  const touched = signal(false)
  const error = signal<string | undefined>(undefined)
  const validators = normalizeValidators(def.validate)

  const runValidate = (): string | undefined => {
    for (const validator of validators) {
      const message = validator(value())
      if (message) return String(message)
    }
    return undefined
  }

  effect(() => {
    if (!touched()) {
      touched()
      return
    }
    value()
    error.set(runValidate())
  })

  const dirty = computed(() => !Object.is(value(), initial))

  const field = value as FormField<T>
  Object.defineProperties(field, {
    error: { value: error as ReadonlySignal<string | undefined> },
    touched: { value: touched as ReadonlySignal<boolean> },
    dirty: { value: dirty },
    blur: {
      value: () => {
        touched.set(true)
        error.set(runValidate())
      },
    },
    validate: {
      value: () => {
        const message = runValidate()
        error.set(message)
        return !message
      },
    },
  })

  return {
    field,
    reset: () => {
      value.set(initial)
      touched.set(false)
      error.set(undefined)
    },
  }
}

export function createForm<T extends Record<string, FieldDef<unknown>>>(schema: T): Form<T> {
  const fields = {} as FormFields<T>
  const resets: Array<() => void> = []

  for (const name of Object.keys(schema) as Array<keyof T>) {
    const created = createField(schema[name]!)
    fields[name] = created.field
    resets.push(created.reset)
  }

  const values = computed(() => {
    const result = {} as FormValues<T>
    for (const name of Object.keys(schema) as Array<keyof T>) {
      result[name] = fields[name]() as FormValues<T>[typeof name]
    }
    return result
  })

  const valid = computed(() =>
    (Object.keys(schema) as Array<keyof T>).every((name) => !fields[name].error()),
  )

  const dirty = computed(() =>
    (Object.keys(schema) as Array<keyof T>).some((name) => fields[name].dirty()),
  )

  return {
    fields,
    values,
    valid,
    dirty,
    validate() {
      let ok = true
      for (const name of Object.keys(schema) as Array<keyof T>) {
        if (!fields[name].validate()) ok = false
      }
      return ok
    },
    reset() {
      for (const reset of resets) reset()
    },
    handleSubmit(onValid) {
      return (event: Event) => {
        event.preventDefault()
        for (const name of Object.keys(schema) as Array<keyof T>) {
          fields[name].blur()
        }
        if (!this.validate()) return
        void onValid(this.values())
      }
    },
  }
}
