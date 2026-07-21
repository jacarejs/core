export const CARD_SOURCE = `export <contract>
  props: {
    title: { type: 'string', required: true }
    subtitle: { type: 'string', default: '' }
  }
  slots: ['default', 'actions']
</contract>

export <view>
  <section class="card">
    <h4 class="card-title">\${title}</h4>
    #if subtitle
      <p class="card-sub">\${subtitle}</p>
    #end
    <div>
      <slot />
    </div>
    <div class="row">
      <slot name="actions" />
    </div>
  </section>
</view>`

export const BADGE_SOURCE = `export <contract>
  props: {
    text: { type: 'string', required: true }
    tone: { type: 'string', default: 'default' }
  }
</contract>

export <view>
  <span class="badge" class-badge-warn=\${tone === 'warn'} class-badge-danger=\${tone === 'danger'}>
    \${text}
  </span>
</view>`

export const ICON_BUTTON_SOURCE = `export <contract>
  props: {
    label: { type: 'string', required: true }
    disabled: { type: 'boolean', default: false }
  }
  emits: ['press']
</contract>

export <view>
  <button type="button" class="btn btn-outline" disabled=\${disabled} on-click=\${() => emit('press')}>
    \${label}
  </button>
</view>`

export const COUNTER_SOURCE = `export <contract>
  props: {
    label: { type: 'string', required: true }
    count: { type: 'number', required: true }
  }
  emits: ['inc']
</contract>

export <view>
  <div class="row">
    <span class="metric">\${label}: \${count}</span>
    <button type="button" class="btn" on-click=\${() => emit('inc')}>+1</button>
  </div>
</view>`

export const FIELD_SOURCE = `export <contract>
  props: {
    label: { type: 'string', required: true }
    field: { type: 'any', required: true }
    type: { type: 'string', default: 'text' }
    placeholder: { type: 'string', default: '' }
  }
</contract>

export <view>
  <label class="field">
    <span class="field-label">\${label}</span>
    <input
      class="input field-input"
      class-invalid=\${!!field.error()}
      type=\${type}
      placeholder=\${placeholder}
      bind-value=\${field}
      on-blur=\${() => field.blur()}
    />
    #if field.error()
      <span class="field-error">\${field.error()}</span>
    #end
  </label>
</view>`

export const MODEL_FIELD_SOURCE = `export <contract>
  props: {
    label: { type: 'string', required: true }
    value: { type: 'string', model: true }
  }
</contract>

export <view>
  <label class="field">
    <span class="field-label">\${label}</span>
    <input class="input" bind-value=\${value} />
  </label>
</view>`
