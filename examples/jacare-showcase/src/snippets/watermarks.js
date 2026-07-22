export const panelCodeWm = `const variant = pulse('nature')
const animation = pulse('bounce')

function replay() {
  playToken.update((n) => n + 1)
}

<ProfileCard
  :variant=\${variant}
  :animation=\${animation}
/>`

export const playgroundCodeWm = `emit('profileSelected', { name })

on-profileSelected=\${(detail) => {
  lastEvent.set(detail.name)
}}`

export const tutorialCodeWm = `export contract
  props: { label: 'string' }
  emits: ['inc']
</contract>

<button on-click=\${() => emit('inc')}>
  \${label}
</button>`
