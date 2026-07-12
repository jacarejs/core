import { describe, expect, it, vi } from 'vitest'
import { branch } from '../src/dom/if.js'
import { bindModel } from '../src/dom/bind-model.js'
import { createForm } from '../src/forms/create-form.js'
import { effect } from '../src/effect.js'
import { signal } from '../src/signal.js'

describe('bindModel', () => {
  it('syncs text input both ways', async () => {
    const text = signal('')
    const input = document.createElement('input')
    document.body.appendChild(input)

    const dispose = bindModel(input, 'value', text)
    input.value = 'hello'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(text()).toBe('hello')

    text.set('jacare')
    await Promise.resolve()
    expect(input.value).toBe('jacare')

    dispose()
    document.body.removeChild(input)
  })

  it('syncs checkbox checked state', async () => {
    const done = signal(false)
    const input = document.createElement('input')
    input.type = 'checkbox'
    document.body.appendChild(input)

    const dispose = bindModel(input, 'checked', done)
    input.checked = true
    input.dispatchEvent(new Event('change', { bubbles: true }))
    expect(done()).toBe(true)

    done.set(false)
    await Promise.resolve()
    expect(input.checked).toBe(false)

    dispose()
    document.body.removeChild(input)
  })

  it('keeps the same input node when mounted inside a branch effect', async () => {
    const text = signal('')
    const host = document.createElement('div')
    document.body.appendChild(host)

    const anchor = document.createComment('if')
    host.appendChild(anchor)

    const disposeBranch = branch(anchor, (mount) => {
      const label = document.createElement('label')
      const input = document.createElement('input')
      input.className = 'field-input'
      label.appendChild(input)
      const cleanups = [bindModel(input, 'value', text)]
      mount(label)
      return () => {
        for (const cleanup of cleanups) cleanup()
      }
    })

    const input = host.querySelector('input') as HTMLInputElement
    input.focus()

    for (const char of 'hello') {
      input.value += char
      input.dispatchEvent(new Event('input', { bubbles: true }))
      await Promise.resolve()
    }

    expect(text()).toBe('hello')
    expect(host.querySelector('input')).toBe(input)
    expect(document.activeElement).toBe(input)

    disposeBranch()
    document.body.removeChild(host)
  })

  it('keeps form fields when createForm fields are bound inside a submitted branch', async () => {
    const submitted = signal(false)
    const form = createForm({
      name: {
        value: '',
        validate: (value) => (value.trim() ? undefined : 'Name is required'),
      },
    })

    const host = document.createElement('div')
    document.body.appendChild(host)
    const anchor = document.createComment('if')
    host.appendChild(anchor)

    const disposeBranch = branch(anchor, (mount) => {
      const cleanups: Array<() => void> = []
      if (submitted()) {
        const message = document.createElement('p')
        message.textContent = 'Thanks'
        mount(message)
      } else {
        const formEl = document.createElement('form')
        const fieldHost = document.createElement('div')
        formEl.appendChild(fieldHost)

        const label = document.createElement('label')
        const input = document.createElement('input')
        input.className = 'field-input'
        label.appendChild(input)
        fieldHost.appendChild(label)
        cleanups.push(bindModel(input, 'value', form.fields.name))

        mount(formEl)
      }
      return () => {
        for (const cleanup of cleanups) cleanup()
      }
    })

    const input = host.querySelector('input') as HTMLInputElement
    input.focus()

    for (const char of 'hello') {
      input.value += char
      input.dispatchEvent(new Event('input', { bubbles: true }))
      await Promise.resolve()
    }

    expect(form.fields.name()).toBe('hello')
    expect(host.querySelector('input')).toBe(input)

    disposeBranch()
    document.body.removeChild(host)
  })

  it('keeps field input when Field-like bindings mount inside a submitted branch', async () => {
    const submitted = signal(false)
    const form = createForm({
      name: {
        value: '',
        validate: (value) => (value.trim() ? undefined : 'Name is required'),
      },
    })
    const field = form.fields.name

    const host = document.createElement('div')
    document.body.appendChild(host)
    const anchor = document.createComment('if')
    host.appendChild(anchor)

    let branchRuns = 0
    const disposeBranch = branch(anchor, (mount) => {
      branchRuns++
      const cleanups: Array<() => void> = []
      if (submitted()) {
        mount(document.createTextNode('Thanks'))
      } else {
        const formEl = document.createElement('form')
        const fieldHost = document.createElement('div')
        formEl.appendChild(fieldHost)

        const label = document.createElement('label')
        const input = document.createElement('input')
        input.className = 'field-input'
        label.appendChild(input)
        cleanups.push(effect(() => {
          input.classList.toggle('invalid', !!field.error())
        }).dispose)
        cleanups.push(bindModel(input, 'value', field))

        const errorAnchor = document.createComment('if')
        label.appendChild(errorAnchor)
        cleanups.push(
          branch(errorAnchor, (errorMount) => {
            const errorCleanups: Array<() => void> = []
            if (field.error()) {
              const error = document.createElement('span')
              const text = document.createTextNode('')
              error.appendChild(text)
              errorCleanups.push(effect(() => {
                text.data = String(field.error())
              }).dispose)
              errorMount(error)
            }
            return () => {
              for (const cleanup of errorCleanups) cleanup()
            }
          }),
        )

        fieldHost.appendChild(label)
        mount(formEl)
      }
      return () => {
        for (const cleanup of cleanups) cleanup()
      }
    })

    expect(branchRuns).toBe(1)

    const input = host.querySelector('input') as HTMLInputElement
    input.focus()

    for (const char of 'hello') {
      input.value += char
      input.dispatchEvent(new Event('input', { bubbles: true }))
      await Promise.resolve()
    }

    expect(branchRuns).toBe(1)
    expect(field()).toBe('hello')
    expect(host.querySelector('input')).toBe(input)

    disposeBranch()
    document.body.removeChild(host)
  })
})

describe('createForm', () => {
  it('validates fields and tracks dirty state', async () => {
    const form = createForm({
      email: {
        value: '',
        validate: (value) => (value.includes('@') ? undefined : 'Invalid email'),
      },
    })

    const field = form.fields.email
    expect(form.valid()).toBe(true)

    field.set('bad')
    await Promise.resolve()
    expect(field.dirty()).toBe(true)

    field.blur()
    await Promise.resolve()
    expect(field.error()).toBe('Invalid email')
    expect(form.valid()).toBe(false)

    field.set('you@jacare.dev')
    await Promise.resolve()
    expect(field.error()).toBeUndefined()
    expect(form.validate()).toBe(true)
  })

  it('submits only when valid', () => {
    const form = createForm({
      name: {
        value: '',
        validate: (value) => (value.trim() ? undefined : 'Required'),
      },
    })

    let submitted: string | undefined
    const handler = form.handleSubmit((values) => {
      submitted = values.name
    })

    const event = { preventDefault: vi.fn() } as unknown as Event
    handler(event)
    expect(submitted).toBeUndefined()
    expect(event.preventDefault).toHaveBeenCalled()

    form.fields.name.set('Jacaré')
    handler(event)
    expect(submitted).toBe('Jacaré')
  })

  it('resets fields to initial values', () => {
    const form = createForm({
      title: { value: 'Draft' },
    })

    form.fields.title.set('Changed')
    form.fields.title.blur()
    form.reset()
    expect(form.fields.title()).toBe('Draft')
    expect(form.fields.title.dirty()).toBe(false)
    expect(form.fields.title.touched()).toBe(false)
  })
})
