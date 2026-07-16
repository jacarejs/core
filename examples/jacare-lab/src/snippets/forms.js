import { viewSnippet } from '../utils/snippet.js'

export const formCode = viewSnippet(
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

// checkboxes need bind-checked on a real pulse, so newsletter lives beside the form
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
    <Field :label=\${'Name'} :field=\${form.fields.name} :type=\${'text'} :placeholder=\${'Ada Lovelace'} />
    <Field :label=\${'Email'} :field=\${form.fields.email} :type=\${'email'} :placeholder=\${'you@jacare.dev'} />
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
)

export const touchedDirtyCode = viewSnippet(
  `// reuses the exact same form declared for the schema demo above
form.fields.name.touched() // true only after the field has been blurred
form.fields.name.dirty()   // true once the value differs from its initial value`,
  `  <div class="row">
    <span class="badge" class-badge-warn=\${form.fields.name.touched()}>name touched: \${form.fields.name.touched() ? 'yes' : 'no'}</span>
    <span class="badge" class-badge-warn=\${form.fields.name.dirty()}>name dirty: \${form.fields.name.dirty() ? 'yes' : 'no'}</span>
    <span class="badge" class-badge-warn=\${form.fields.email.touched()}>email touched: \${form.fields.email.touched() ? 'yes' : 'no'}</span>
  </div>
  <p class="muted">Focus and blur the fields in the schema demo above — these flip in real time.</p>`,
)

export const confirmCode = viewSnippet(
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
    <Field :label=\${'Confirm password'} :field=\${confirmForm.fields.confirm} :type=\${'password'} :placeholder=\${'Repeat password'} />
  </div>`,
)

export const multiValidatorCode = viewSnippet(
  `const signupForm = createForm({
  username: {
    value: '',
    validate: [
      (value) => (value.trim().length < 3 ? 'At least 3 characters' : undefined),
      (value) => (/\\s/.test(value) ? 'No spaces allowed' : undefined),
    ],
  },
})`,
  `  <Field :label=\${'Username'} :field=\${signupForm.fields.username} :type=\${'text'} :placeholder=\${'jacare_dev'} />`,
)
