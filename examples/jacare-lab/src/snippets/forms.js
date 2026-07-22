import { viewSnippet, codeFiles } from '../utils/snippet.js'
import { FIELD_SOURCE } from './component-sources.js'

const fieldChild = [{ name: 'components/Field.jcr', code: FIELD_SOURCE }]

export const formCode = codeFiles(
  viewSnippet(
    `const form = createForm({
  name: {
    value: '',
    validate: (value) => (value.trim().length < 2 ? 'Name is too short' : undefined),
  },
  email: {
    value: '',
    validate: (value) => (value.includes('@') ? undefined : 'Enter a valid email'),
  },
})

const newsletter = pulse(false)
const submittedValues = pulse(null)

const onSubmit = form.handleSubmit((values) => {
  submittedValues.set({ name: values.name, email: values.email, newsletter: newsletter() })
})

function resetForm() {
  form.reset()
  newsletter.set(false)
  submittedValues.set(null)
}`,
    `  <form class="stack" on-submit=\${onSubmit}>
    <Field
      :label=\${'Name'}
      bind-value=\${form.fields.name}
      :error=\${form.fields.name.error()}
      :type=\${'text'}
      :placeholder=\${'Ada Lovelace'}
      on-blur=\${() => form.fields.name.blur()}
    />
    <Field
      :label=\${'Email'}
      bind-value=\${form.fields.email}
      :error=\${form.fields.email.error()}
      :type=\${'email'}
      :placeholder=\${'you@jacare.dev'}
      on-blur=\${() => form.fields.email.blur()}
    />
    <label class="row"><input type="checkbox" bind-checked=\${newsletter} /> Subscribe to the newsletter</label>
    <div class="row">
      <button type="submit" class="btn">Submit</button>
      <button type="button" class="btn btn-outline" on-click=\${resetForm}>Reset</button>
    </div>
  </form>

  <p class="muted">valid: \${form.valid() ? 'yes' : 'no'} · dirty: \${form.dirty() ? 'yes' : 'no'}</p>
  #if submittedValues()
    <p class="muted">Submitted: \${JSON.stringify(submittedValues())}</p>
  #else
    <p class="muted">Nothing submitted yet.</p>
  #end`,
  ),
  fieldChild,
)

export const touchedDirtyCode = viewSnippet(
  `form.fields.name.touched()
form.fields.name.dirty()`,
  `  <div class="row">
    <span class="badge" class-badge-warn=\${form.fields.name.touched()}>name touched: \${form.fields.name.touched() ? 'yes' : 'no'}</span>
    <span class="badge" class-badge-warn=\${form.fields.name.dirty()}>name dirty: \${form.fields.name.dirty() ? 'yes' : 'no'}</span>
    <span class="badge" class-badge-warn=\${form.fields.email.touched()}>email touched: \${form.fields.email.touched() ? 'yes' : 'no'}</span>
  </div>
  <p class="muted">Focus and blur the fields in the schema demo above — these flip in real time.</p>`,
)

export const confirmCode = codeFiles(
  viewSnippet(
    `const password = pulse('')
const confirmForm = createForm({
  confirm: {
    value: '',
    validate: (value) => (value.length > 0 && value !== password() ? 'Passwords do not match' : undefined),
  },
})`,
    `  <div class="stack">
    <label class="field">
      <span class="field-label">Password</span>
      <input class="input" type="password" bind-value=\${password} />
    </label>
    <Field
      :label=\${'Confirm password'}
      bind-value=\${confirmForm.fields.confirm}
      :error=\${confirmForm.fields.confirm.error()}
      :type=\${'password'}
      :placeholder=\${'Repeat password'}
      on-blur=\${() => confirmForm.fields.confirm.blur()}
    />
  </div>`,
  ),
  fieldChild,
)

export const multiValidatorCode = codeFiles(
  viewSnippet(
    `const signupForm = createForm({
  username: {
    value: '',
    validate: [
      (value) => (value.trim().length < 3 ? 'At least 3 characters' : undefined),
      (value) => (/\\s/.test(value) ? 'No spaces allowed' : undefined),
    ],
  },
})`,
    `  <Field
    :label=\${'Username'}
    bind-value=\${signupForm.fields.username}
    :error=\${signupForm.fields.username.error()}
    :type=\${'text'}
    :placeholder=\${'jacare_dev'}
    on-blur=\${() => signupForm.fields.username.blur()}
  />`,
  ),
  fieldChild,
)
